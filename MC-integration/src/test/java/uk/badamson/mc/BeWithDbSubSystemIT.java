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
import static org.junit.jupiter.api.Assertions.assertAll;

import java.util.concurrent.TimeoutException;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.test.web.reactive.server.WebTestClient.ResponseSpec;
import org.testcontainers.containers.Network;
import org.testcontainers.junit.jupiter.Testcontainers;

import uk.badamson.mc.repository.McDatabaseContainer;

/**
 * <p>
 * Basic system test for the MC database and MC backend containers operating
 * together, testing it operating as a pristine (fresh) installation.
 * </p>
 * <p>
 * These tests demonstrate that it is possible to configure the back-end to
 * communicate correctly with the database. They do not really demonstrate
 * specific correct functionality.
 * </p>
 */
@TestMethodOrder(OrderAnnotation.class)
@Testcontainers
@Tag("IT")
public class BeWithDbSubSystemIT implements AutoCloseable {

   private static final String BE_HOST = "be";
   private static final String DB_HOST = "db";

   private static final String DB_ROOT_PASSWORD = "secret2";
   private static final String DB_USER_PASSWORD = "secret3";
   private static final String ADMINISTARTOR_PASSWORD = "secret4";

   private final Network network = Network.newNetwork();

   private final McDatabaseContainer db = new McDatabaseContainer(
            DB_ROOT_PASSWORD, DB_USER_PASSWORD).withNetwork(network)
                     .withNetworkAliases(DB_HOST);

   private final McBackEndContainer be = new McBackEndContainer(DB_HOST,
            DB_USER_PASSWORD, ADMINISTARTOR_PASSWORD).withNetwork(network)
                     .withNetworkAliases(BE_HOST);

   @Test
   @Order(2)
   public void addUser() {
      final var user = new User("jeff", "password", Authority.ALL, true, true,
               true, true);

      final ResponseSpec response = be.addUser(user);

      response.expectStatus().isCreated();
   }

   private void assertThatNoErrorMessagesLogged(final String logs) {
      assertThat(logs, not(containsString("ERROR")));
   }

   @Override
   public void close() {
      be.close();
      db.close();
      network.close();
   }

   @BeforeEach
   public void start() {
      /*
       * Start the containers bottom-up, and wait until each is ready, to reduce
       * the number of transient connection errors.
       */
      db.start();
      be.start();
   }

   @Test
   @Order(1)
   public void startUp() throws TimeoutException, InterruptedException {
      try {
         be.awaitLogMessage(McBackEndContainer.STARTED_MESSAGE);
         be.awaitLogMessage(McBackEndContainer.CONNECTION_MESSAGE);
      } finally {// Provide useful diagnostics even if timeout
         final var logs = be.getLogs();
         assertAll("Log suitable messages",
                  () -> assertThat(logs,
                           containsString(McBackEndContainer.STARTED_MESSAGE)),
                  () -> assertThat(logs,
                           containsString(
                                    McBackEndContainer.CONNECTION_MESSAGE)),
                  () -> assertThatNoErrorMessagesLogged(logs),
                  () -> assertThat(logs,
                           not(containsString("Unable to start"))));
         be.assertHealthCheckOk();
      }
   }

   @AfterEach
   public void stop() {
      /*
       * Stop the resources top-down, to reduce the number of transient
       * connection errors.
       */
      be.stop();
      db.stop();
      close();
   }
}
