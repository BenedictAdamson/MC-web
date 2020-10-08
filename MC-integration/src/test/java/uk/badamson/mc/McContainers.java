package uk.badamson.mc;
/*
 * © Copyright Benedict Adamson 2019-20.
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

import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.MatcherAssert.assertThat;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Optional;

import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.containers.BrowserWebDriverContainer;
import org.testcontainers.containers.BrowserWebDriverContainer.VncRecordingMode;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.lifecycle.Startable;
import org.testcontainers.lifecycle.TestDescription;
import org.testcontainers.lifecycle.TestLifecycleAware;

import uk.badamson.mc.presentation.McFrontEndContainer;
import uk.badamson.mc.presentation.McReverseProxyContainer;
import uk.badamson.mc.repository.McDatabaseContainer;

/**
 * <p>
 * An assembly of Testcontainers Docker containers for integration testing the
 * MC software.
 * </p>
 */
public class McContainers
         implements Startable, AutoCloseable, TestLifecycleAware {

   public static enum HttpServer {
      BACK_END, FRONT_END, INGRESS
   }// enum

   private static final SimpleDateFormat FILENAME_TIMESTAMP_FORMAT = new SimpleDateFormat(
            "YYYYMMdd-HHmmss");
   private static final String FILENAME_FORMAT = "FAILED-%s-%s-%s.log";

   private static final String BE_HOST = "be";
   private static final String DB_HOST = "db";
   private static final String FE_HOST = "fe";
   private static final String REVERSE_PROXY_HOST = "in";

   private static final URI BASE_PRIVATE_NETWORK_URI = URI
            .create("http://" + REVERSE_PROXY_HOST);

   private static final String DB_ROOT_PASSWORD = "secret2";
   private static final String DB_USER_PASSWORD = "secret3";
   public static final String ADMINISTARTOR_PASSWORD = "secret4";

   private static void assertThatNoErrorMessagesLogged(final String container,
            final String logs) {
      assertThat(container + " logs no errors", logs,
               not(containsString("ERROR:")));
   }

   public static URI createIngressPrivateNetworkUriFromPath(final String path) {
      return BASE_PRIVATE_NETWORK_URI.resolve(path);
   }

   private static void retainLogFile(final Path directory, final String prefix,
            final String timestamp, final String host,
            final GenericContainer<?> container) {
      final String leafName = String.format(FILENAME_FORMAT, prefix, timestamp,
               host);
      final Path path = directory.resolve(leafName);
      try {
         Files.writeString(path, container.getLogs(), StandardCharsets.UTF_8);
      } catch (final IOException e) {
         throw new RuntimeException(e);
      }
   }

   private final Path failureRecordingDirectory;

   private final Network network = Network.newNetwork();

   private final McDatabaseContainer db = new McDatabaseContainer(
            DB_ROOT_PASSWORD, DB_USER_PASSWORD).withNetwork(network)
                     .withNetworkAliases(DB_HOST);

   private final McBackEndContainer be = new McBackEndContainer(DB_HOST,
            DB_USER_PASSWORD, ADMINISTARTOR_PASSWORD).withNetwork(network)
                     .withNetworkAliases(BE_HOST);

   private final McFrontEndContainer fe = new McFrontEndContainer()
            .withNetwork(network).withNetworkAliases(FE_HOST);

   private final McReverseProxyContainer in = new McReverseProxyContainer()
            .withNetwork(network).withNetworkAliases(REVERSE_PROXY_HOST);

   private final BrowserWebDriverContainer<?> browser;

   /**
    * @param failureRecordingDirectory
    *           The location of a directory in which to store files holding
    *           verbose information about failed test cases. Or {@code null} if
    *           no such records are to be made.
    */
   public McContainers(final Path failureRecordingDirectory) {
      this.failureRecordingDirectory = failureRecordingDirectory;
      browser = new BrowserWebDriverContainer<>();
      browser.withCapabilities(new FirefoxOptions().addPreference(
               "security.insecure_field_warning.contextual.enabled", false))
               .withNetwork(network);
      if (failureRecordingDirectory != null) {
         try {
            Files.createDirectories(failureRecordingDirectory);
         } catch (final IOException e) {
            throw new IllegalArgumentException(e);
         }
         browser.withRecordingMode(VncRecordingMode.RECORD_FAILING,
                  failureRecordingDirectory.toFile());
      }
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
    * @param user
    *           The user to add.
    * @throws NullPointerException
    *            If {@code user} is null
    * @throws RuntimeException
    *            If the addition was rejected by the back-end.
    */
   public void addUser(final User user) {
      try {
         final var response = be.addUser(user);
         response.expectStatus().is2xxSuccessful();
      } catch (final Exception e) {
         throw new RuntimeException("Failed to add user", e);
      }
   }

   @Override
   public void afterTest(final TestDescription description,
            final Optional<Throwable> throwable) {
      browser.afterTest(description, throwable);
      if (failureRecordingDirectory != null && throwable.isPresent()) {
         retainLogFiles(description.getFilesystemFriendlyName());
      }
   }

   public void assertThatNoErrorMessagesLogged() {
      assertThatNoErrorMessagesLogged("db", db.getLogs());
      assertThatNoErrorMessagesLogged("be", be.getLogs());
      assertThatNoErrorMessagesLogged("fe", fe.getLogs());
      assertThatNoErrorMessagesLogged("in", in.getLogs());
      assertThatNoErrorMessagesLogged("browser", browser.getLogs());
   }

   @Override
   public void beforeTest(final TestDescription description) {
      browser.beforeTest(description);
   }

   @Override
   public void close() {
      /*
       * Close the resources top-down, to reduce the number of transient
       * connection errors.
       */
      browser.close();
      in.close();
      fe.close();
      be.close();
      db.close();
      network.close();
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

   public RemoteWebDriver getWebDriver() {
      return browser.getWebDriver();
   }

   private void retainLogFiles(final String prefix) {
      final var timestamp = FILENAME_TIMESTAMP_FORMAT.format(new Date());
      retainLogFile(failureRecordingDirectory, prefix, timestamp, DB_HOST, db);
      retainLogFile(failureRecordingDirectory, prefix, timestamp, BE_HOST, be);
      retainLogFile(failureRecordingDirectory, prefix, timestamp, FE_HOST, fe);
      retainLogFile(failureRecordingDirectory, prefix, timestamp,
               REVERSE_PROXY_HOST, in);
   }

   @Override
   public void start() {
      /*
       * Start the containers bottom-up, and wait until each is ready, to reduce
       * the number of transient connection errors.
       */
      db.start();
      be.start();
      fe.start();
      in.start();
      browser.start();
   }

   @Override
   public void stop() {
      /*
       * Stop the resources top-down, to reduce the number of transient
       * connection errors.
       */
      browser.stop();
      in.stop();
      fe.stop();
      be.stop();
      db.stop();
      close();
   }
}
