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
import static org.hamcrest.core.Is.is;
import static org.junit.jupiter.api.Assertions.assertAll;

import java.util.concurrent.TimeoutException;

import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient.ListBodySpec;
import org.testcontainers.containers.Network;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import uk.badamson.mc.repository.McDatabaseContainer;

/**
 * <p>
 * Basic system test for the MC database and MC backend containers operating
 * together, testing it operating as a pristine (fresh) installation.
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

   private WebTestClient.ResponseSpec response;
   private ListBodySpec<Player> responsePlayerList;

   private void assertThatNoErrorMessagesLogged(final String logs) {
      assertThat(logs, not(containsString("ERROR")));
   }

   private void can_get_the_list_of_players() {
      getJsonFromBe("/api/player");
      responseIsOk();
      responsePlayerList = response.expectBodyList(Player.class);
   }

   @Test
   @Order(2)
   public void getHomePage() throws TimeoutException, InterruptedException {
      waitUntilReady();
      getJsonFromBe("/");
      responseIsOk();
      assertThatNoErrorMessagesLogged(beContainer.getLogs());
   }

   private void getJsonFromBe(final String path) {
      response = beContainer.getJson(path);
   }

   /**
    * <h1>Scenario: Get players of fresh instance</h1>
    * <ol>
    * <li>Given a fresh instance of MC
    * <li>And not logged in
    * <li>And not presenting a CSRF token
    * <li>When getting the players (The path of the players resource is
    * {@code /api/player})
    * <li>Then MC serves the resource
    * <li>And there is only one player, the administrator, with the default name
    * <ol>
    * <li>And the response message is a list of players
    * <li>And the list of players has one player
    * <li>And the list of players includes the administrator
    * <li>And the list of players includes a player named "Administrator"
    * </ol>
    * </ol>
    *
    * @throws TimeoutException
    *            If the system takes too long to become ready, or the response
    *            takes too long.
    */
   @Test
   @Order(2)
   public void getPlayerDirectory()
            throws TimeoutException, InterruptedException {
      waitUntilReady();

      getJsonFromBe("/api/player");

      {
         responseIsOk();
         can_get_the_list_of_players();
         the_list_of_players_has_one_player();
         the_list_of_players_includes_the_administrator();
      }
      beContainer.assertHealthCheckOk();
      {
         final var logs = beContainer.getLogs();
         assertThat(logs, not(containsString("requires authentication")));
         assertThat(logs, not(containsString("Exception authenticating")));
         assertThatNoErrorMessagesLogged(logs);
      }
   }

   private void responseIsOk() {
      response.expectStatus().isOk();
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

   private void the_list_of_players_has_one_player() {
      responsePlayerList.hasSize(1);
   }

   private void the_list_of_players_includes_the_administrator() {
      responsePlayerList.value(
               players -> players.stream()
                        .filter(player -> Player.ADMINISTRATOR_USERNAME
                                 .equals(player.getUsername()))
                        .count(),
               is(1L));
   }

   private void waitUntilReady() throws TimeoutException, InterruptedException {
      dbContainer.waitUntilAcceptsConnections();
      beContainer.waitUntilReady();
   }
}
