package uk.badamson.mc;

import org.openqa.selenium.OutputType;
import org.testcontainers.lifecycle.TestDescription;
import uk.badamson.mc.presentation.McReverseProxyContainer;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

public final class MockedBeContainers extends BaseContainers {
    private static final String MS_HOST = "ms";
    private static final String INGRESS_HOST = "in";
    private final MockMcBackEndContainer ms = new MockMcBackEndContainer();
    private final McReverseProxyContainer ingress = McReverseProxyContainer.createWithMockBe();

    public MockedBeContainers(@Nullable final Path failureRecordingDirectory) {
        super(failureRecordingDirectory);
        ms.withNetwork(getNetwork()).withNetworkAliases(MS_HOST);
        ingress.withNetwork(getNetwork()).withNetworkAliases(INGRESS_HOST);
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
        startInParallel(ms, getFrontEnd(), getBrowser());
        ingress.start();
    }

    private void cleanup() {
    }

    public void retainScreenshot(@Nonnull final String baseFileName) {
        if (getFailureRecordingDirectory() != null) {
            final String leafName = baseFileName + ".png";
            final Path path = getFailureRecordingDirectory().resolve(leafName);
            try {
                final var bytes = getWebDriver().getScreenshotAs(OutputType.BYTES);
                Files.write(path, bytes);
            } catch (final Exception e) {
                throw new RuntimeException(e);
            }

        }

    }

    private void retainLogFiles(@Nonnull final String baseFileName) {
        assert getFailureRecordingDirectory() != null;
        retainLogFile(getFailureRecordingDirectory(), baseFileName, MS_HOST, ms);
        retainLogFile(getFailureRecordingDirectory(), baseFileName, FE_HOST, getFrontEnd());
        retainLogFile(getFailureRecordingDirectory(), baseFileName, INGRESS_HOST, ingress);
    }

    @Override
    public void stop() {
        cleanup();
        getBrowser().stop();
        ingress.stop();
        getFrontEnd().stop();
        ms.stop();
    }

    @Override
    public void beforeTest(final TestDescription description) {
        getWebDriver().manage().deleteAllCookies();
        getBrowser().beforeTest(description);
        ms.reset();
    }

    @Override
    public void afterTest(final TestDescription description, final Optional<Throwable> throwable) {
        getBrowser().afterTest(description, throwable);
        if (getFailureRecordingDirectory() != null) {
            String baseFileName = description.getFilesystemFriendlyName();
            retainLogFiles(baseFileName);
            retainScreenshot(baseFileName);
        }

        cleanup();
    }

    public MockMcBackEndContainer getBackEnd() {
        return ms;
    }
}
