package uk.badamson.mc;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.containers.BrowserWebDriverContainer;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.lifecycle.Startable;
import org.testcontainers.lifecycle.TestDescription;
import org.testcontainers.lifecycle.TestLifecycleAware;
import org.testcontainers.utility.DockerImageName;
import uk.badamson.mc.presentation.HomePage;
import uk.badamson.mc.presentation.McFrontEndContainer;
import uk.badamson.mc.presentation.McReverseProxyContainer;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

public final class MockedBeWorld implements Startable, TestLifecycleAware {

    public MockedBeWorld(@Nullable final Path failureRecordingDirectory) {
        fe.withNetwork(network).withNetworkAliases(FE_HOST);
        ms.withNetwork(network).withNetworkAliases(MS_HOST);
        ingress.withNetwork(network).withNetworkAliases(INGRESS_HOST);
        this.failureRecordingDirectory = failureRecordingDirectory;
        browser.withCreateContainerCmdModifier(cmd -> Objects.requireNonNull(cmd.getHostConfig())
                .withCpuCount(2L));
        browser.withCapabilities(new FirefoxOptions().addPreference("security.insecure_field_warning.contextual.enabled", false)).withNetwork(network);
        if (failureRecordingDirectory != null) {
            try {
                Files.createDirectories(failureRecordingDirectory);
            } catch (final IOException e) {
                throw new IllegalArgumentException(e);
            }
            browser.withRecordingMode(BrowserWebDriverContainer.VncRecordingMode.RECORD_ALL, failureRecordingDirectory.toFile());
        }

    }

    public MockedBeWorld() {
        this(DEFAULT_FAILURE_RECORDING_DIRECTORY);
    }

    public MockMcBackEndContainer getBackEnd() {
        return ms;
    }

    @Override
    public void close() {
        cleanup();
        stop();
        network.close();
    }

    public User createUserWithRole(Authority role) {
        return createUser(EnumSet.of(role));
    }

    private User createUser(final Set<Authority> authorities) {
        final BasicUserDetails userDetails = generateBasicUserDetails(authorities);
        final UUID id = UUID.randomUUID();
        return new User(id, userDetails);
    }

    @Override
    public void start() {
        ms.start();
        fe.start();
        ingress.start();
        browser.start();
        webDriver = browser.getWebDriver();
    }

    private void cleanup() {
    }

    public void retainScreenshot(@Nonnull final String baseFileName) {
        if (failureRecordingDirectory != null) {
            final String leafName = baseFileName + ".png";
            final Path path = failureRecordingDirectory.resolve(leafName);
            try {
                final var bytes = webDriver.getScreenshotAs(OutputType.BYTES);
                Files.write(path, bytes);
            } catch (final Exception e) {
                throw new RuntimeException(e);
            }

        }

    }

    private void retainLogFiles(@Nonnull final String baseFileName) {
        retainLogFile(failureRecordingDirectory, baseFileName, MS_HOST, ms);
        retainLogFile(failureRecordingDirectory, baseFileName, FE_HOST, fe);
        retainLogFile(failureRecordingDirectory, baseFileName, INGRESS_HOST, ingress);
    }

    private static void retainLogFile(final Path directory, final String baseFileName, final String host, final GenericContainer<?> container) {
        final String leafName = baseFileName + "-" + host + ".log";
        final Path path = directory.resolve(leafName);
        try {
            Files.writeString(path, container.getLogs(), StandardCharsets.UTF_8);
        } catch (final IOException e) {
            throw new RuntimeException(e);
        }

    }

    @Override
    public void stop() {
        cleanup();
        browser.stop();
        ingress.stop();
        fe.stop();
        ms.stop();
    }

    @Override
    public void beforeTest(final TestDescription description) {
        webDriver.manage().deleteAllCookies();
        browser.beforeTest(description);
        ms.reset();
    }

    @Override
    public void afterTest(final TestDescription description, final Optional<Throwable> throwable) {
        browser.afterTest(description, throwable);
        if (failureRecordingDirectory != null) {
            String baseFileName = description.getFilesystemFriendlyName();
            retainLogFiles(baseFileName);
            retainScreenshot(baseFileName);
        }

        cleanup();
    }

    private BasicUserDetails generateBasicUserDetails(final Set<Authority> authorities) {
        final var sequenceId = ++nUsers;
        final var username = "User " + sequenceId;
        final var password = "password" + sequenceId;
        return new BasicUserDetails(username, password, authorities, true, true, true, true);
    }

    public HomePage getHomePage() {
        final HomePage homePage = new HomePage(getWebDriver());
        homePage.get();
        return homePage;
    }

    private WebDriver getWebDriver() {
        Objects.requireNonNull(webDriver, "webDriver");
        return webDriver;
    }

    public void notLoggedIn() {
        currentLoggedInUser = null;
        getBackEnd().mockGetSelfUnauthenticated();
    }

    public HomePage logInAsUserWithTheRole(final Authority role) {
        return logInAsUser(createUser(EnumSet.of(role)));
    }

    public HomePage logInAsUserWithoutTheRole(final Authority role) {
        final Set<Authority> roles = EnumSet.complementOf(EnumSet.of(role));
        return logInAsUser(createUser(roles));
    }

    public HomePage logInAsUser(final User user) {
        currentLoggedInUser = user;
        getBackEnd().mockLogin(user, UUID.randomUUID().toString(), UUID.randomUUID().toString());
        getBackEnd().mockGetSelf(currentLoggedInUser);
        HomePage homePage = getHomePage();
        homePage.awaitIsReady();
        return homePage;
    }

    private static final String FE_HOST = "fe";
    private static final String MS_HOST = "ms";
    private static final String INGRESS_HOST = "in";
    private static final Path DEFAULT_FAILURE_RECORDING_DIRECTORY = Path.of(".", "target", "test-logs");
    private static final DockerImageName BROWSER_IMAGE_NAME = DockerImageName.parse("selenium/standalone-firefox:4.1.4");
    private final Path failureRecordingDirectory;
    private final Network network = Network.newNetwork();
    private final McFrontEndContainer fe = new McFrontEndContainer();
    private final MockMcBackEndContainer ms = new MockMcBackEndContainer();
    private final McReverseProxyContainer ingress = McReverseProxyContainer.createWithMockBe();
    private final BrowserWebDriverContainer<?> browser = new BrowserWebDriverContainer<>(BROWSER_IMAGE_NAME);
    private RemoteWebDriver webDriver;
    private int nUsers;
    private User currentLoggedInUser;
}
