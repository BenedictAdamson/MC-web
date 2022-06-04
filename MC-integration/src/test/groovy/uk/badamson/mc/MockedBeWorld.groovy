package uk.badamson.mc

import org.openqa.selenium.OutputType
import org.openqa.selenium.WebDriver
import org.openqa.selenium.firefox.FirefoxOptions
import org.openqa.selenium.remote.RemoteWebDriver
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

    private static final Path DEFAULT_FAILURE_RECORDING_DIRECTORY = Path.of('.', 'target', 'test-logs')

    private static final DockerImageName BROWSER_IMAGE_NAME = DockerImageName.parse("selenium/standalone-firefox:4.1.4")

    private final Path failureRecordingDirectory
    private final Network network = Network.newNetwork()
    private final McFrontEndContainer fe = new McFrontEndContainer()
    private final MockMcBackEnd ms = new MockMcBackEnd()
    private final McReverseProxyContainer ingress = McReverseProxyContainer.createWithMockBe()
    private final BrowserWebDriverContainer browser = new BrowserWebDriverContainer<>(BROWSER_IMAGE_NAME)
    private RemoteWebDriver webDriver

    private int nUsers

    private Page expectedPage

    private User currentLoggedInUser

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

    @Override
    void close() {
        cleanup()
        stop()
        network.close()
    }

    User createUserWithRole(Authority role) {
        createUser(EnumSet.of(role))
    }

    private User createUser(final Set<Authority> authorities) {
        final var userDetails = generateBasicUserDetails(authorities)
        final var id = UUID.randomUUID()
        return new User(id, userDetails)
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
        ms.reset()
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

    HomePage getHomePage() {
        final var homePage = new HomePage(getWebDriver())
        homePage.get()
        expectedPage = homePage
        return homePage
    }

    private WebDriver getWebDriver() {
        Objects.requireNonNull(webDriver, "webDriver")
        webDriver
    }

    void notLoggedIn() {
        currentLoggedInUser = null
        backEnd.mockGetSelfUnauthenticated()
    }

    HomePage logInAsUserWithTheRole(final Authority role) {
        logInAsUser(createUser(EnumSet.of(role)))
    }

    HomePage logInAsUserWithoutTheRole(final Authority role) {
        final Set<Authority> roles = EnumSet.complementOf(EnumSet.of(role))
        logInAsUser(createUser(roles))
    }

    HomePage logInAsUser(final User user) {
        currentLoggedInUser = user
        backEnd.mockLogin(user, UUID.randomUUID().toString(), UUID.randomUUID().toString())
        backEnd.mockGetSelf(currentLoggedInUser)
        def homePage = getHomePage()
        homePage.awaitIsReady()
        homePage
    }
}