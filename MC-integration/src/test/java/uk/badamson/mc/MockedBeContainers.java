package uk.badamson.mc;

import org.testcontainers.lifecycle.TestDescription;
import uk.badamson.mc.presentation.McReverseProxyContainer;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.nio.file.Path;

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
        ingress.close();
        ms.close();
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

    @Override
    protected void retainLogFiles(@Nonnull final String prefix) {
        assert getFailureRecordingDirectory() != null;
        super.retainLogFiles(prefix);
        retainLogFile(getFailureRecordingDirectory(), prefix, MS_HOST, ms);
        retainLogFile(getFailureRecordingDirectory(), prefix, INGRESS_HOST, ingress);
    }

    @Override
    public void stop() {
        getBrowser().stop();
        ingress.stop();
        getFrontEnd().stop();
        ms.stop();
    }

    @Override
    public void beforeTest(final TestDescription description) {
        super.beforeTest(description);
        ms.reset();
    }

    public MockMcBackEndContainer getBackEnd() {
        return ms;
    }
}
