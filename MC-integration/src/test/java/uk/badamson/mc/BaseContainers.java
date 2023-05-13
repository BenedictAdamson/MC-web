package uk.badamson.mc;
/*
 * © Copyright Benedict Adamson 2020-23.
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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.containers.BrowserWebDriverContainer;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.lifecycle.Startable;
import org.testcontainers.lifecycle.TestDescription;
import org.testcontainers.lifecycle.TestLifecycleAware;
import uk.badamson.mc.presentation.McFrontEndContainer;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import javax.annotation.OverridingMethodsMustInvokeSuper;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Stream;

abstract class BaseContainers implements Startable, TestLifecycleAware {
    private static final String FE_HOST = "fe";
    private static final Duration WEBDRIVER_IMPLICIT_WAIT = Duration.ofSeconds(30);
    private static final Capabilities CAPABILITIES = new FirefoxOptions().addPreference("security.insecure_field_warning.contextual.enabled", false);

    @Nullable
    private final Path failureRecordingDirectory;
    private final Network network = Network.newNetwork();
    private final McFrontEndContainer frontEnd;
    private final BrowserWebDriverContainer<?> browser;

    protected BaseContainers(@Nullable Path failureRecordingDirectory) {
        this.failureRecordingDirectory = failureRecordingDirectory;
        if (failureRecordingDirectory != null) {
            try {
                Files.createDirectories(failureRecordingDirectory);
            } catch (final IOException e) {
                throw new IllegalArgumentException(e);
            }
        }
        frontEnd = new McFrontEndContainer()
                .withNetwork(getNetwork()).withNetworkAliases(FE_HOST);
        browser = createBrowserContainer(network, failureRecordingDirectory);
    }

    @Nonnull
    private static BrowserWebDriverContainer<?> createBrowserContainer(
            @Nonnull Network network,
            @Nullable final Path failureRecordingDirectory) {
        final var browser = new BrowserWebDriverContainer<>();
        browser.withCreateContainerCmdModifier(cmd -> Objects.requireNonNull(cmd.getHostConfig())
                .withCpuCount(2L));
        browser.withCapabilities(CAPABILITIES);
        browser.withNetwork(network);
        if (failureRecordingDirectory != null) {
            browser.withRecordingMode(BrowserWebDriverContainer.VncRecordingMode.RECORD_ALL, failureRecordingDirectory.toFile());
        }
        return browser;
    }

    protected static void retainLogFile(
            @Nonnull final Path directory,
            @Nonnull final String baseFileName,
            @Nonnull final String host,
            @Nonnull final GenericContainer<?> container) {
        final String leafName = baseFileName + "-" + host + ".log";
        final Path path = directory.resolve(leafName);
        try {
            Files.writeString(path, container.getLogs(), StandardCharsets.UTF_8);
        } catch (final IOException e) {
            throw new RuntimeException(e);
        }
    }

    protected static void startInParallel(@Nonnull GenericContainer<?>... containers) {
        Stream.of(containers).parallel().forEach(GenericContainer::start);
    }

    @OverridingMethodsMustInvokeSuper
    @Override
    public void close() {
        browser.close();
        frontEnd.close();
        network.close();
    }

    @OverridingMethodsMustInvokeSuper
    @Override
    public void beforeTest(final TestDescription description) {
        getBrowser().beforeTest(description);
    }

    @OverridingMethodsMustInvokeSuper
    @Override
    public void afterTest(final TestDescription description, final Optional<Throwable> throwable) {
        getBrowser().afterTest(description, throwable);
        if (getFailureRecordingDirectory() != null) {
            final var prefix = description.getFilesystemFriendlyName();
            retainLogFiles(prefix);
        }
    }

    @OverridingMethodsMustInvokeSuper
    protected void retainLogFiles(final String prefix) {
        assert getFailureRecordingDirectory() != null;
        retainLogFile(getFailureRecordingDirectory(), prefix, FE_HOST, frontEnd);
    }

    @Nullable
    protected final Path getFailureRecordingDirectory() {
        return failureRecordingDirectory;
    }

    @Nonnull
    public final RemoteWebDriver createWebDriver() {
        final var driver = new RemoteWebDriver(getBrowser().getSeleniumAddress(), CAPABILITIES);
        driver.manage().timeouts().implicitlyWait(WEBDRIVER_IMPLICIT_WAIT);
        return driver;
    }

    @Nonnull
    protected final BrowserWebDriverContainer<?> getBrowser() {
        return browser;
    }

    @Nonnull
    protected final McFrontEndContainer getFrontEnd() {
        return frontEnd;
    }

    @Nonnull
    protected final Network getNetwork() {
        return network;
    }
}
