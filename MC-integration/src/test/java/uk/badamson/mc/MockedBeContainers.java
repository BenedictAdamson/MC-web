package uk.badamson.mc;
/*
 * © Copyright Benedict Adamson 2019-23.
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
