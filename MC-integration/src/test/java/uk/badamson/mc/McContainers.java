package uk.badamson.mc;
/*
 * © Copyright Benedict Adamson 2019-22.
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
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.containers.BrowserWebDriverContainer;
import org.testcontainers.containers.BrowserWebDriverContainer.VncRecordingMode;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.lifecycle.TestDescription;
import org.testcontainers.utility.DockerImageName;
import uk.badamson.mc.presentation.McFrontEndContainer;
import uk.badamson.mc.presentation.McReverseProxyContainer;
import uk.badamson.mc.repository.McDatabaseContainer;

import javax.annotation.Nonnull;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.MatcherAssert.assertThat;

/**
 * <p>
 * An assembly of Testcontainers Docker containers for integration testing the
 * MC software.
 * </p>
 */
public class McContainers extends BaseContainers {

    public enum HttpServer {
        BACK_END, FRONT_END, INGRESS
    }// enum

    private static final SimpleDateFormat FILENAME_TIMESTAMP_FORMAT = new SimpleDateFormat(
            "yyyyMMdd-HHmmss");
    private static final String SCREENSHOT_FILENAME_FORMAT = "FAILED-%s-%s.png";

    private static final String BE_HOST = "be";
    private static final String DB_HOST = "db";
    private static final String FE_HOST = "fe";
    private static final String REVERSE_PROXY_HOST = "in";

    private static final URI BASE_PRIVATE_NETWORK_URI = URI
            .create("http://" + REVERSE_PROXY_HOST);

    private static final String DB_ROOT_PASSWORD = "secret2";
    private static final String DB_USER_PASSWORD = "secret3";
    public static final String ADMINISTRATOR_PASSWORD = "secret4";

    private static final DockerImageName BROWSER_IMAGE_NAME = DockerImageName.parse("selenium/standalone-firefox:4.1.4");

    private static void assertThatNoErrorMessagesLogged(final String container,
                                                        final String logs) {
        assertThat(container + " logs no errors", logs,
                not(containsString("ERROR:")));
    }

    public static URI createIngressPrivateNetworkUriFromPath(final String path) {
        return BASE_PRIVATE_NETWORK_URI.resolve(path);
    }

    private final Network network = Network.newNetwork();

    private final McDatabaseContainer db = new McDatabaseContainer(
            DB_ROOT_PASSWORD, DB_USER_PASSWORD).withNetwork(network)
            .withNetworkAliases(DB_HOST);

    private final McBackEndContainer be = new McBackEndContainer(DB_HOST,
            DB_USER_PASSWORD, ADMINISTRATOR_PASSWORD).withNetwork(network)
            .withNetworkAliases(BE_HOST);

    private final McFrontEndContainer fe = new McFrontEndContainer()
            .withNetwork(network).withNetworkAliases(FE_HOST);

    private final McReverseProxyContainer in = McReverseProxyContainer.createWithRealBe()
            .withNetwork(network).withNetworkAliases(REVERSE_PROXY_HOST);

    private BrowserWebDriverContainer<?> browser;

    /**
     * @param failureRecordingDirectory The location of a directory in which to store files holding
     *                                  verbose information about failed test cases. Or {@code null} if
     *                                  no such records are to be made.
     */
    public McContainers(final Path failureRecordingDirectory) {
        super(failureRecordingDirectory);
    }

    /**
     * <p>
     * Add a user in the database, through the back-end, using the API of the
     * back-end.
     * </p>
     * <p>
     * As this does not use the front-end, it is more suitable for setting up
     * test-cases.
     * </p>
     *
     * @param userDetails The details of the user to add.
     * @return the unique ID of the added user
     * @throws NullPointerException If {@code userDetails} is null
     * @throws RuntimeException     If the addition was rejected by the back-end.
     */
    public UUID addUser(final BasicUserDetails userDetails) {
        return be.addUser(userDetails);
    }

    /**
     * {@inheritDoc}
     *
     * <p>
     * Calling this method invalidates the {@linkplain RemoteWebDriver web
     * drivers} returned by previous calls to {@link #getWebDriver()}.
     * </p>
     */
    @Override
    public void afterTest(final TestDescription description,
                          final Optional<Throwable> throwable) {
        requireBroswer();
        browser.afterTest(description, throwable);
        if (getFailureRecordingDirectory() != null && throwable.isPresent()) {
            final var timestamp = FILENAME_TIMESTAMP_FORMAT.format(new Date());
            final var filenamePrefix = description.getFilesystemFriendlyName();
            retainLogFiles(filenamePrefix);
            retainScreenshot(filenamePrefix, timestamp);
        }
        stopBrowser();
    }

    public void assertThatNoErrorMessagesLogged() {
        assertThatNoErrorMessagesLogged("db", db.getLogs());
        assertThatNoErrorMessagesLogged("be", be.getLogs());
        assertThatNoErrorMessagesLogged("fe", fe.getLogs());
        assertThatNoErrorMessagesLogged("in", in.getLogs());
        if (browser != null) {
            assertThatNoErrorMessagesLogged("browser", browser.getLogs());
        }
    }

    @Override
    public void beforeTest(final TestDescription description) {
        createAndStartBrowser();
        browser.beforeTest(description);
    }

    @Override
    public void close() {
        /*
         * Close the resources top-down, to reduce the number of transient
         * connection errors.
         */
        if (browser != null) {
            browser.close();
        }
        in.close();
        fe.close();
        be.close();
        db.close();
        network.close();
    }

    private void createAndStartBrowser() {
        browser = new BrowserWebDriverContainer<>(BROWSER_IMAGE_NAME);
        browser.withCreateContainerCmdModifier(cmd -> Objects.requireNonNull(cmd.getHostConfig())
                .withCpuCount(2L));
        browser.withCapabilities(new FirefoxOptions().addPreference(
                        "security.insecure_field_warning.contextual.enabled", false))
                .withNetwork(network);
        if (getFailureRecordingDirectory() != null) {
            try {
                Files.createDirectories(getFailureRecordingDirectory());
            } catch (final IOException e) {
                throw new IllegalArgumentException(e);
            }
            browser.withRecordingMode(VncRecordingMode.RECORD_FAILING,
                    getFailureRecordingDirectory().toFile());
        }
        browser.start();
    }

    public Game.Identifier createGame(final UUID scenario) {
        return be.createGame(scenario);
    }

    public URI createUriFromPath(final HttpServer server, final String path) {
        GenericContainer<?> container = null;
        switch (server) {
            case BACK_END:
                container = be;
                break;
            case FRONT_END:
                container = fe;
                break;
            case INGRESS:
                container = in;
                break;
        }
        final var base = URI.create("http://" + container.getHost() + ":"
                + container.getFirstMappedPort());
        return base.resolve(path);
    }

    public Stream<NamedUUID> getScenarios() {
        return be.getScenarios();
    }

    @Nonnull
    @Override
    public RemoteWebDriver getWebDriver() {
        requireBroswer();
        return browser.getWebDriver();
    }

    private void requireBroswer() {
        if (browser == null) {
            throw new IllegalStateException("no browser");
        }
    }

    private void retainLogFiles(final String prefix) {
        assert getFailureRecordingDirectory() != null;
        retainLogFile(getFailureRecordingDirectory(), prefix, DB_HOST, db);
        retainLogFile(getFailureRecordingDirectory(), prefix, BE_HOST, be);
        retainLogFile(getFailureRecordingDirectory(), prefix, FE_HOST, fe);
        retainLogFile(getFailureRecordingDirectory(), prefix, REVERSE_PROXY_HOST, in);
    }

    private void retainScreenshot(final String prefix, final String timestamp) {
        final var leafName = String.format(SCREENSHOT_FILENAME_FORMAT, prefix,
                timestamp);
        assert getFailureRecordingDirectory() != null;
        final var path = getFailureRecordingDirectory().resolve(leafName);
        try {
            final var bytes = getWebDriver().getScreenshotAs(OutputType.BYTES);
            Files.write(path, bytes);
        } catch (final Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void start() {
        /*
         * Start the containers bottom-up, and wait until each is ready, to reduce
         * the number of transient connection errors.
         */
        startInParallel(db, fe);
        be.start();
        in.start();
    }

    @Override
    public void stop() {
        /*
         * Stop the resources top-down, to reduce the number of transient
         * connection errors.
         */
        stopBrowser();
        in.stop();
        fe.stop();
        be.stop();
        db.stop();
        close();
    }

    private void stopBrowser() {
        if (browser != null) {
            browser.getWebDriver().quit();
            browser.stop();
            browser.close();
            browser = null;
        }
    }
}
