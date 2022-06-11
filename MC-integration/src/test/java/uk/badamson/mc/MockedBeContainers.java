package uk.badamson.mc;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.containers.BrowserWebDriverContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.lifecycle.TestDescription;
import org.testcontainers.utility.DockerImageName;
import uk.badamson.mc.presentation.McFrontEndContainer;
import uk.badamson.mc.presentation.McReverseProxyContainer;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Objects;
import java.util.Optional;

public final class MockedBeContainers extends BaseContainers {

    private static final String FE_HOST = "fe";
    private static final String MS_HOST = "ms";
    private static final String INGRESS_HOST = "in";
    private static final DockerImageName BROWSER_IMAGE_NAME = DockerImageName.parse("selenium/standalone-firefox:4.1.4");
    private final Network network = Network.newNetwork();
    private final McFrontEndContainer fe = new McFrontEndContainer();
    private final MockMcBackEndContainer ms = new MockMcBackEndContainer();
    private final McReverseProxyContainer ingress = McReverseProxyContainer.createWithMockBe();
    private final BrowserWebDriverContainer<?> browser = new BrowserWebDriverContainer<>(BROWSER_IMAGE_NAME);
    private RemoteWebDriver webDriver;

    public MockedBeContainers(@Nullable final Path failureRecordingDirectory) {
        super(failureRecordingDirectory);
        fe.withNetwork(network).withNetworkAliases(FE_HOST);
        ms.withNetwork(network).withNetworkAliases(MS_HOST);
        ingress.withNetwork(network).withNetworkAliases(INGRESS_HOST);
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

    @Override
    public void close() {
        cleanup();
        stop();
        network.close();
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
        if (getFailureRecordingDirectory() != null) {
            final String leafName = baseFileName + ".png";
            final Path path = getFailureRecordingDirectory().resolve(leafName);
            try {
                final var bytes = webDriver.getScreenshotAs(OutputType.BYTES);
                Files.write(path, bytes);
            } catch (final Exception e) {
                throw new RuntimeException(e);
            }

        }

    }

    private void retainLogFiles(@Nonnull final String baseFileName) {
        assert getFailureRecordingDirectory() != null;
        retainLogFile(getFailureRecordingDirectory(), baseFileName, MS_HOST, ms);
        retainLogFile(getFailureRecordingDirectory(), baseFileName, FE_HOST, fe);
        retainLogFile(getFailureRecordingDirectory(), baseFileName, INGRESS_HOST, ingress);
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
        if (getFailureRecordingDirectory() != null) {
            String baseFileName = description.getFilesystemFriendlyName();
            retainLogFiles(baseFileName);
            retainScreenshot(baseFileName);
        }

        cleanup();
    }

    @Nonnull
    @Override
    public RemoteWebDriver getWebDriver() {
        return webDriver;
    }

    public MockMcBackEndContainer getBackEnd() {
        return ms;
    }

    public BrowserWebDriverContainer<?> getBrowser() {
        return browser;
    }
}
