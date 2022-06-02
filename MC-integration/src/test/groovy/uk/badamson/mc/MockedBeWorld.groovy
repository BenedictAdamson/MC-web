package uk.badamson.mc

import org.openqa.selenium.*
import org.openqa.selenium.firefox.FirefoxOptions
import org.openqa.selenium.remote.RemoteWebDriver
import org.openqa.selenium.support.ui.WebDriverWait
import org.opentest4j.AssertionFailedError
import org.testcontainers.containers.BrowserWebDriverContainer
import org.testcontainers.containers.GenericContainer
import org.testcontainers.containers.Network
import org.testcontainers.lifecycle.Startable
import org.testcontainers.lifecycle.TestDescription
import org.testcontainers.lifecycle.TestLifecycleAware
import org.testcontainers.utility.DockerImageName
import uk.badamson.mc.presentation.HomePage
import uk.badamson.mc.presentation.McFrontEndContainer
import uk.badamson.mc.presentation.McReverseProxyContainer
import uk.badamson.mc.presentation.Page

import javax.annotation.Nonnull
import javax.annotation.Nullable
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.nio.file.Path
import java.time.Duration
import java.util.NoSuchElementException
import java.util.concurrent.TimeoutException
import java.util.concurrent.atomic.AtomicReference

/*
 * © Copyright Benedict Adamson 2019-22.
 *
 * This file is part of MC.
 *
 * MC is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MC is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with MC.  If not, see <https://www.gnu.org/licenses/>.
 */

final class MockedBeWorld implements Startable, TestLifecycleAware {
    private static final String FE_HOST = 'fe'
    private static final String MS_HOST = 'ms'
    private static final String INGRESS_HOST = "in"

    private static final URI BASE_INGRESS_URI = new URI('http', INGRESS_HOST, null, null)
    private static final Path DEFAULT_FAILURE_RECORDING_DIRECTORY = Path.of('.', 'target', 'test-logs')

    static String getPathOfUrl(final String url) {
        return URI.create(url).getPath()
    }

    private static <TYPE> boolean intersects(final Set<TYPE> set1,
                                             final Set<TYPE> set2) {
        /* The sets intersect if we can find any element in both. */
        return set1.stream().filter(x -> set2.contains(x)).findAny().isPresent()
    }

    private static final DockerImageName BROWSER_IMAGE_NAME = DockerImageName.parse("selenium/standalone-firefox:4.1.4")

    private final Path failureRecordingDirectory
    private final Network network = Network.newNetwork()
    private final McFrontEndContainer fe = new McFrontEndContainer()
    private final MockMcBackEnd ms = new MockMcBackEnd()
    private final McReverseProxyContainer ingress = McReverseProxyContainer.createWithMockBe()
    private final BrowserWebDriverContainer browser = new BrowserWebDriverContainer<>(BROWSER_IMAGE_NAME)
    private RemoteWebDriver webDriver

    private int nUsers

    private User administratorUser = User.createAdministrator('secret4')

    private URI url

    private Page expectedPage

    private User currentUser

    private boolean loggedIn

    MockedBeWorld(@Nullable final Path failureRecordingDirectory = DEFAULT_FAILURE_RECORDING_DIRECTORY) {
        fe.withNetwork(network).withNetworkAliases(FE_HOST)
        ms.withNetwork(network).withNetworkAliases(MS_HOST)
        ingress.withNetwork(network).withNetworkAliases(INGRESS_HOST)
        this.failureRecordingDirectory = failureRecordingDirectory
        browser.withCapabilities(new FirefoxOptions().addPreference(
                "security.insecure_field_warning.contextual.enabled", false))
                .withNetwork(network)
        if (failureRecordingDirectory != null) {
            try {
                Files.createDirectories(failureRecordingDirectory)
            } catch (final IOException e) {
                throw new IllegalArgumentException(e)
            }
            browser.withRecordingMode(BrowserWebDriverContainer.VncRecordingMode.RECORD_ALL,
                    failureRecordingDirectory.toFile())
        }
    }

    MockMcBackEnd getBackEnd() {
        ms
    }

    /**
     * Require that the current page has an element with a given tag.
     *
     * @param tag
     *           The HTML tag of the required element
     * @throws AssertionFailedError*            if no such element is present.
     */
    WebElement assertHasElementWithTag(@Nonnull final String tag) {
        Objects.requireNonNull(tag, "tag")
        try {
            return getWebDriver().findElement(By.tagName(tag))
        } catch (final NoSuchElementException e) {
            throw new AssertionFailedError("Has element with tag " + tag, e)
        }
    }

    void awaitSuccessOrErrorMessage(final String expectedSuccessUrlPath)
            throws IllegalStateException {
        final var webDriver = getWebDriver()
        final var currentPath = new AtomicReference<String>()
        try {
            new WebDriverWait(webDriver, Duration.ofSeconds(17)).until(driver -> {
                currentPath.set(getPathOfUrl(driver.getCurrentUrl()))
                return expectedSuccessUrlPath == currentPath.get()
                        || !driver.findElements(By.className("error")).isEmpty()
            })
        } catch (final Exception e) {// give better diagnostics
            throw new IllegalStateException(
                    "No indication of success or failure (at " + currentPath.get()
                            + ")",
                    e)
        }
    }

    @Override
    void close() {
        cleanup()
        stop()
        network.close()
    }

    private User createUser(final Set<Authority> authorities) {
        final var userDetails = generateBasicUserDetails(authorities)
        final var id = UUID.randomUUID()
        return new User(id, userDetails)
    }

    void currentUserDoesNotHaveRole(final Authority role) {
        Objects.requireNonNull(role, "role")

        final var authorities = EnumSet.complementOf(EnumSet.of(role))
        currentUser = createUser(authorities)
    }

    void currentUserHasRoles(final Set<Authority> included,
                             final Set<Authority> excluded) {
        Objects.requireNonNull(included, "included")
        Objects.requireNonNull(excluded, "excluded")
        if (intersects(included, excluded)) {
            throw new IllegalArgumentException("Contradictory role constraints")
        }

        currentUser = createUser(included)
    }

    void currentUserIsAdministrator() {
        Objects.requireNonNull(administratorUser, "administratorUser")
        currentUser = administratorUser
    }

    void currentUserIsUnknownUser() {
        currentUser = null
    }

    @Override
    void start() {
        ms.start()
        fe.start()
        ingress.start()
        browser.start()
        webDriver = browser.getWebDriver()
    }

    private void cleanup() {
        expectedPage = null
    }

    void retainScreenshot(@Nonnull final String baseFileName) {
        if (failureRecordingDirectory != null) {
            final var leafName = "${baseFileName}.png"
            final var path = failureRecordingDirectory.resolve(leafName)
            try {
                final var bytes = webDriver.getScreenshotAs(OutputType.BYTES)
                Files.write(path, bytes)
            } catch (final Exception e) {
                throw new RuntimeException(e)
            }
        }
    }

    private void retainLogFiles(@Nonnull final String baseFileName) {
        retainLogFile(failureRecordingDirectory, baseFileName, MS_HOST, ms)
        retainLogFile(failureRecordingDirectory, baseFileName, FE_HOST, fe)
        retainLogFile(failureRecordingDirectory, baseFileName, INGRESS_HOST, ingress)
    }

    private static void retainLogFile(final Path directory, final String baseFileName, final String host,
                                      final GenericContainer container) {
        final var leafName = baseFileName + '-' + host + '.log'
        final var path = directory.resolve(leafName)
        try {
            Files.writeString(path, container.getLogs(), StandardCharsets.UTF_8)
        } catch (final IOException e) {
            throw new RuntimeException(e)
        }
    }

    @Override
    void stop() {
        cleanup()
        browser.stop()
        ingress.stop()
        fe.stop()
        ms.stop()
    }


    @Override
    void beforeTest(final TestDescription description) {
        webDriver.manage().deleteAllCookies()
        browser.beforeTest(description)
    }

    @Override
    void afterTest(final TestDescription description,
                   final Optional<Throwable> throwable) {
        browser.afterTest(description, throwable)
        if (failureRecordingDirectory != null) {
            def baseFileName = description.getFilesystemFriendlyName()
            retainLogFiles(baseFileName)
            retainScreenshot(baseFileName)
        }
        cleanup()
    }

    private BasicUserDetails generateBasicUserDetails(
            final Set<Authority> authorities) {
        final var sequenceId = ++nUsers
        final var username = "User " + sequenceId
        final var password = "password" + sequenceId
        return new BasicUserDetails(username, password, authorities, true, true,
                true, true)
    }

    /**
     * <p>
     * Get the current expected page, which is expected to be of a given class,
     * with failure of that expectation being interpreted as a test failure.
     * </p>
     * <ul>
     * <li>Not null</li>
     * </ul>
     *
     * @param <PAGE>
     *           The class of the expected page.
     * @param clazz
     *           The {@link Class} object of the class of the expected page.
     * @return The current expected page.
     * @throws AssertionFailedError*            <ul>
     *            <li>If there is no current expected page.</li>
     *            <li>If the class of the current expected page is not the given
     * {@code clazz} class.</li>
     *            </ul>
     * @see #getExpectedPage(Class)
     */
    @Nonnull
    <PAGE extends Page> PAGE getAndAssertExpectedPage(
            @Nonnull final Class<PAGE> clazz) {
        try {
            return getExpectedPage(clazz)
        } catch (final IllegalStateException e) {
            throw new AssertionFailedError(
                    "Current expected page is a " + clazz.getTypeName(), e)
        }
    }

    /**
     * <p>
     * The {@linkplain URI#getPath() path} component of the
     * {@linkplain WebDriver#getCurrentUrl() current URL} of the browser.
     * </p>
     * <p>
     * Tests should use this value, rather than the current URL of the browser,
     * because the current URL includes the server host-name, which is a test
     * implementation detail.
     * </p>
     */
    @Nonnull
    String getCurrentUrlPath() {
        return getPathOfUrl(getWebDriver().getCurrentUrl())
    }

    @Nullable
    User getCurrentUser() {
        return currentUser
    }

    /**
     * <p>
     * Get the current expected page, which is expected to be of a given class.
     * </p>
     * <ul>
     * <li>Not null</li>
     * </ul>
     *
     * @param <PAGE>
     *           The class of the expected page.
     * @param clazz
     *           The {@link Class} object of the class of the expected page.
     * @return The current expected page.
     * @throws IllegalStateException*            <ul>
     *            <li>If there is no current expected page.</li>
     *            <li>If the class of the current expected page is not the given
     * {@code clazz} class.</li>
     *            </ul>
     * @see #getAndAssertExpectedPage(Class)
     */
    @Nonnull
    <PAGE extends Page> PAGE getExpectedPage(
            @Nonnull final Class<PAGE> clazz) {
        Objects.requireNonNull(clazz, "clazz")
        try {
            return clazz.cast(expectedPage)
        } catch (final ClassCastException e) {
            throw new IllegalStateException(
                    "Current expected page is not a " + clazz.getTypeName(), e)
        }
    }

    HomePage getHomePage() {
        final var homePage = new HomePage(getWebDriver())
        homePage.get()
        expectedPage = homePage
        return homePage
    }

    /**
     * <p>
     * The currently logged-in user.
     * </p>
     * <p>
     * Or null if no user is currently logged-in.</li>
     *
     * @return the user
     */
    User getLoggedInUser() {
        return loggedIn ? currentUser : null
    }

    /**
     * <p>
     * Perform an HTTP GET of the front-end of the SUT, using the previously
     * {@linkplain #setUrlPath(String) set URL}, using {@link WebDriver} to give
     * a similar experience to manually using a web browser.
     * </p>
     *
     * @throws IllegalStateException*            <ul>
     *            <li>If the scenario has beean {@linkplain #cleanup() cleaned-up}.</li>
     *            <li>If the this has been {@linkplain #close() closed}.</li>
     *            <li>If no URL was previously {@linkplain #setUrlPath(String)
     *            set}.</li>
     *            </ul>
     * @throws WebDriverException*            If the resource given by the URL does not exist.
     */
    void getUrlUsingBrowser() throws WebDriverException {
        try {
            Objects.requireNonNull(webDriver, "webDriver")
            Objects.requireNonNull(url, "url")
        } catch (final NullPointerException e) {
            throw new IllegalStateException(e)
        }
        webDriver.get(url.toASCIIString())
    }

    /**
     * <p>
     * GET the URL that has a given path component.
     * </p>
     *
     * @param path
     *           The path component
     * @throws NullPointerException*            If {@code path} is null.
     * @throws IllegalArgumentException*            If {@code path} violates RFC 2396
     */
    void getUrlUsingBrowser(final String path) {
        setUrlPath(path)
        getUrlUsingBrowser()
    }

    WebDriver getWebDriver() {
        Objects.requireNonNull(webDriver, "webDriver")
        webDriver
    }

    void setExpectedPage(@Nonnull final Page expectedPage) {
        this.expectedPage = Objects.requireNonNull(expectedPage, "expectedPage")
    }

    /**
     * <p>
     * Indicate that the next web operation on the SUT will be for the URL that
     * has a given path component.
     * </p>
     *
     * @param path
     *           The path component
     * @throws IllegalArgumentException*            If {@code path} violates RFC 2396
     */
    void setUrlPath(@Nonnull final String path) {
        url = BASE_INGRESS_URI.resolve(path)
    }

    /**
     * <p>
     * Wait until the {@linkplain #getCurrentUrlPath() path component of the
     * current URL of the browser} becomes equal to a given path, of a timeout
     * expires.
     * </p>
     *
     * @param timeout
     *           The maximum time, in seconds, to wait for the path of the
     *           browser to become equal to the given {@code path}.
     * @param path
     *           The wanted path
     * @throws TimeoutException*            If the browser path does not become equal to the given
     * {@code path} within the given {@code timeout}.
     */
    void waitUntilCurrentUrlPath(final long timeout, final String path)
            throws TimeoutException {
        final var current = new AtomicReference<String>()
        try {
            new WebDriverWait(getWebDriver(), Duration.ofSeconds(timeout)).until(driver -> {
                final var p = getPathOfUrl(driver.getCurrentUrl())
                current.set(p)
                return p == path
            })
        } catch (final org.openqa.selenium.TimeoutException ignored) {
            throw new TimeoutException("Timeout while waiting URL path (currently "
                    + current.get() + ") to become " + path)
        }
    }

    void notLoggedIn() {
        this.loggedIn = false
        currentUserIsUnknownUser()
        backEnd.mockGetSelfUnauthenticated()
    }

    void navigateToScenariosPage() {
        setExpectedPage(getHomePage().navigateToScenariosPage())
    }
}