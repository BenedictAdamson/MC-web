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

import org.openqa.selenium.OutputType;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.lifecycle.Startable;
import org.testcontainers.lifecycle.TestDescription;
import org.testcontainers.lifecycle.TestLifecycleAware;
import uk.badamson.mc.presentation.HomePage;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

public abstract class BaseWorld implements Startable, TestLifecycleAware {
    protected static final Path DEFAULT_FAILURE_RECORDING_DIRECTORY = Path.of(".", "target", "test-logs");

    private final Path failureRecordingDirectory;
    private RemoteWebDriver webDriver;
    private int nUsers;

    protected BaseWorld(@Nullable final Path failureRecordingDirectory) {
        this.failureRecordingDirectory = failureRecordingDirectory;
    }

    @Override
    public final void start() {
        var containers = getContainers();
        containers.start();
        webDriver = containers.createWebDriver();
    }

    @Override
    public final void stop() {
        getContainers().stop();
    }

    @Override
    public final void beforeTest(final TestDescription description) {
        if (webDriver == null) {
            throw new IllegalStateException("not started");
        }
        webDriver.manage().deleteAllCookies();
        getContainers().beforeTest(description);
    }

    @Override
    public final void afterTest(final TestDescription description, final Optional<Throwable> throwable) {
        getContainers().afterTest(description, throwable);
        if (failureRecordingDirectory != null) {
            String baseFileName = description.getFilesystemFriendlyName();
            retainScreenshot(baseFileName);
        }
    }


    @PostConstruct
    public final void open() {
        getContainers().start();
    }

    @Override
    @PreDestroy
    public final void close() {
        stop();
        getContainers().close();
    }

    public final User createUserWithRole(Authority role) {
        return createUser(EnumSet.of(role));
    }

    @Nonnull
    protected final User createUser(@Nonnull final Set<Authority> authorities) {
        final var userDetails = generateBasicUserDetails(authorities);
        final var id = addUser(userDetails);
        return new User(id, userDetails);
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

    protected final BasicUserDetails generateBasicUserDetails(final Set<Authority> authorities) {
        final var sequenceId = ++nUsers;
        final var username = "User " + sequenceId;
        final var password = "password" + sequenceId;
        return new BasicUserDetails(username, password, authorities,
                true, true, true, true);
    }

    public final HomePage navigateToHomePage() {
        final var homePage = new HomePage(getWebDriver());
        homePage.get();
        homePage.awaitIsReady();
        return homePage;
    }

    private WebDriver getWebDriver() {
        Objects.requireNonNull(webDriver, "webDriver");
        return webDriver;
    }

    @Nonnull
    public abstract BaseContainers getContainers();


    @Nonnull
    protected abstract UUID addUser(@Nonnull final BasicUserDetails userDetails);

}
