package uk.badamson.mc;

import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.lifecycle.Startable;
import org.testcontainers.lifecycle.TestLifecycleAware;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

abstract class BaseContainers implements Startable, TestLifecycleAware {

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

    @Nullable
    private final Path failureRecordingDirectory;

    public BaseContainers(@Nullable Path failureRecordingDirectory) {
        this.failureRecordingDirectory = failureRecordingDirectory;
    }

    @Nullable
    protected final Path getFailureRecordingDirectory() {
        return failureRecordingDirectory;
    }

    @Nonnull
    public abstract RemoteWebDriver getWebDriver();
}
