package uk.badamson.mc;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.containers.BrowserWebDriverContainer;
import org.testcontainers.lifecycle.TestDescription;
import uk.badamson.mc.presentation.McFrontEndContainer;
import uk.badamson.mc.presentation.McReverseProxyContainer;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

public final class MockedBeContainers extends BaseContainers {

    private static final String FE_HOST = "fe";
    private static final String MS_HOST = "ms";
    private static final String INGRESS_HOST = "in";
    private final McFrontEndContainer fe = new McFrontEndContainer();
    private final MockMcBackEndContainer ms = new MockMcBackEndContainer();
    private final McReverseProxyContainer ingress = McReverseProxyContainer.createWithMockBe();
    private final BrowserWebDriverContainer<?> browser;
    private RemoteWebDriver webDriver;

    public MockedBeContainers(@Nullable final Path failureRecordingDirectory) {
        super(failureRecordingDirectory);
        fe.withNetwork(getNetwork()).withNetworkAliases(FE_HOST);
        ms.withNetwork(getNetwork()).withNetworkAliases(MS_HOST);
        ingress.withNetwork(getNetwork()).withNetworkAliases(INGRESS_HOST);
        browser = createBrowserContainer(getNetwork(), failureRecordingDirectory);
    }

    @Override
    public void close() {
        cleanup();
        stop();
        super.close();
    }

    @Override
    public void start() {
        /*
         * Start the containers bottom-up, and wait until each is ready, to reduce
         * the number of transient connection errors.
         */
        startInParallel(ms, fe, browser);
        ingress.start();
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
