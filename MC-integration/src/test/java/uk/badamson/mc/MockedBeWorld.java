package uk.badamson.mc;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.lifecycle.Startable;
import org.testcontainers.lifecycle.TestDescription;
import org.testcontainers.lifecycle.TestLifecycleAware;
import uk.badamson.mc.presentation.HomePage;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

public final class MockedBeWorld implements Startable, TestLifecycleAware {
    private static final Path DEFAULT_FAILURE_RECORDING_DIRECTORY = Path.of(".", "target", "test-logs");

    private final MockedBeContainers containers;
    private final Path failureRecordingDirectory;
    private RemoteWebDriver webDriver;
    private int nUsers;
    private User currentLoggedInUser;

    public MockedBeWorld(@Nullable final Path failureRecordingDirectory) {
        containers = new MockedBeContainers(failureRecordingDirectory);
        this.failureRecordingDirectory = failureRecordingDirectory;
    }

    public MockedBeWorld() {
        this(DEFAULT_FAILURE_RECORDING_DIRECTORY);
    }

    public MockMcBackEndContainer getBackEnd() {
        return containers.getBackEnd();
    }

    @Override
    public void close() {
        stop();
        containers.close();
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
        containers.start();
        webDriver = containers.getBrowser().getWebDriver();
    }

    private void retainScreenshot(@Nonnull final String baseFileName) {
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

    @Override
    public void stop() {
        containers.stop();
    }

    @Override
    public void beforeTest(final TestDescription description) {
        webDriver.manage().deleteAllCookies();
        containers.beforeTest(description);
    }

    @Override
    public void afterTest(final TestDescription description, final Optional<Throwable> throwable) {
        containers.afterTest(description, throwable);
        if (failureRecordingDirectory != null) {
            String baseFileName = description.getFilesystemFriendlyName();
            retainScreenshot(baseFileName);
        }
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
}
