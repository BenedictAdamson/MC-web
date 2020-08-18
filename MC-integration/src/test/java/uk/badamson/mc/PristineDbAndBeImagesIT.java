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

import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.testcontainers.containers.Network;
import org.testcontainers.junit.jupiter.Container;
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
public class PristineDbAndBeImagesIT {

   private final Network containersNetwork = Network.newNetwork();

   @Container
   private final McDatabaseContainer dbContainer = new McDatabaseContainer()
            .withNetwork(containersNetwork).withNetworkAliases("db");

   @Container
   private final McBackEndContainer beContainer = new McBackEndContainer()
            .withNetwork(containersNetwork).withNetworkAliases("mc")
            .withCommand("--spring.data.mongodb.host=db")
            .withExposedPorts(McBackEndContainer.PORT);

   private void assertThatNoErrorMessagesLogged(final String logs) {
      assertThat(logs, not(containsString("ERROR")));
   }

   @Test
   @Order(1)
   public void start() throws TimeoutException, InterruptedException {
      waitUntilReady();

      final var logs = beContainer.getLogs();
      assertAll("Log suitable messages",
               () -> assertThat(logs,
                        containsString(McBackEndContainer.STARTED_MESSAGE)),
               () -> assertThat(logs,
                        containsString(McBackEndContainer.CONNECTION_MESSAGE)),
               () -> assertThatNoErrorMessagesLogged(logs),
               () -> assertThat(logs, not(containsString("Unable to start"))));
      beContainer.assertHealthCheckOk();
   }

   private void waitUntilReady() throws TimeoutException, InterruptedException {
      dbContainer.waitUntilAcceptsConnections();
      beContainer.waitUntilReady();
   }
}
