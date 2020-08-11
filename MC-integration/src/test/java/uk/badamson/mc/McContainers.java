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

import java.util.concurrent.TimeoutException;

import org.testcontainers.containers.Network;
import org.testcontainers.lifecycle.Startable;

import uk.badamson.mc.repository.McDatabaseContainer;

/**
 * <p>
 * An assembly of Testcontainers Docker containers for integration testing the
 * MC software.
 * </p>
 */
public class McContainers implements Startable, AutoCloseable {

   private final Network network = Network.newNetwork();

   private final McDatabaseContainer db = new McDatabaseContainer()
            .withNetwork(network).withNetworkAliases("db");

   private final McBackEndContainer be = new McBackEndContainer()
            .withNetwork(network).withNetworkAliases("be")
            .withCommand("--spring.data.mongodb.host=db");

   @Override
   public void close() {
      /*
       * Close the resources top-down, to reduce the number of transient
       * connection errors.
       */
      be.close();
      db.close();
      network.close();
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
      be.stop();
      db.stop();
   }
}
