package uk.badamson.mc;

import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.containers.BrowserWebDriverContainer;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.lifecycle.Startable;
import org.testcontainers.lifecycle.TestLifecycleAware;
import org.testcontainers.utility.DockerImageName;
import uk.badamson.mc.presentation.McFrontEndContainer;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import javax.annotation.OverridingMethodsMustInvokeSuper;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Objects;
import java.util.stream.Stream;

abstract class BaseContainers implements Startable, TestLifecycleAware {
    protected static final String FE_HOST = "fe";
    private static final DockerImageName BROWSER_IMAGE_NAME = DockerImageName.parse("selenium/standalone-firefox:4.1.4");


    private static BrowserWebDriverContainer<?> createBrowserContainer(
            @Nonnull Network network,
            @Nullable final Path failureRecordingDirectory) {
        final var browser = new BrowserWebDriverContainer<>(BROWSER_IMAGE_NAME);
        browser.withCreateContainerCmdModifier(cmd -> Objects.requireNonNull(cmd.getHostConfig())
                .withCpuCount(2L));
        browser.withCapabilities(
                new FirefoxOptions().addPreference("security.insecure_field_warning.contextual.enabled", false)
                );
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

    @Nullable
    private final Path failureRecordingDirectory;

    private final Network network = Network.newNetwork();

    private final McFrontEndContainer frontEnd;

    private final BrowserWebDriverContainer<?> browser;

    public BaseContainers(@Nullable Path failureRecordingDirectory) {
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

    @OverridingMethodsMustInvokeSuper
    @Override
    public void close() {
        browser.close();
        frontEnd.close();
        network.close();
    }

    @Nullable
    protected final Path getFailureRecordingDirectory() {
        return failureRecordingDirectory;
    }

    @Nonnull
    public final RemoteWebDriver getWebDriver() {
        return getBrowser().getWebDriver();
    }

    @Nonnull
    protected final BrowserWebDriverContainer<?> getBrowser() {
        return browser;
    }

    public McFrontEndContainer getFrontEnd() {
        return frontEnd;
    }

    @Nonnull
    protected final Network getNetwork() {
        return network;
    }
}
