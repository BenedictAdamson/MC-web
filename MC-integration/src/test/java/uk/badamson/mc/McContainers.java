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

import java.net.URI;
import java.util.concurrent.TimeoutException;

import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.containers.BrowserWebDriverContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.lifecycle.Startable;

import uk.badamson.mc.presentation.McReverseProxyContainer;
import uk.badamson.mc.repository.McDatabaseContainer;

/**
 * <p>
 * An assembly of Testcontainers Docker containers for integration testing the
 * MC software.
 * </p>
 */
public class McContainers implements Startable, AutoCloseable {

   private static final URI BASE_URI = URI
            .create("http://" + McReverseProxyContainer.HOST);

   public static String getUri(final String path) {
      return BASE_URI.resolve(path).toASCIIString();
   }

   private final Network network = Network.newNetwork();

   private final McDatabaseContainer db = new McDatabaseContainer()
            .withNetwork(network);

   private final McBackEndContainer be = new McBackEndContainer()
            .withNetwork(network).withCommand("--spring.data.mongodb.host=db");

   private final McReverseProxyContainer in = new McReverseProxyContainer()
            .withNetwork(network);

   private final BrowserWebDriverContainer<?> browser = new BrowserWebDriverContainer<>()
            .withCapabilities(new FirefoxOptions()).withNetwork(network);

   @Override
   public void close() {
      /*
       * Close the resources top-down, to reduce the number of transient
       * connection errors.
       */
      browser.close();
      in.close();
      be.close();
      db.close();
      network.close();
   }

   public RemoteWebDriver getWebDriver() {
      return browser.getWebDriver();
   }

   @Override
   public void start() {
      /*
       * Start the containers bottom-up, and wait until each is ready, to reduce
       * the number of transient connection errors.
       */
      try {
         db.start();
         db.waitUntilAcceptsConnections();
         be.start();
         be.waitUntilReady();
         be.awaitHealthCheckOk();
         in.start();
         browser.start();
      } catch (TimeoutException | InterruptedException e) {
         throw new RuntimeException("Unable to start all mc containers", e);
      }
   }

   @Override
   public void stop() {
      /*
       * Stop the resources top-down, to reduce the number of transient
       * connection errors.
       */
      browser.stop();
      in.stop();
      be.stop();
      db.stop();
   }
}
