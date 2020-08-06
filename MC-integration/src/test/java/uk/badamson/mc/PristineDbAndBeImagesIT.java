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
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient.ListBodySpec;
import org.testcontainers.containers.Network;
import org.testcontainers.containers.output.WaitingConsumer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

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

   public static final int MC_LISTENING_PORT = 8080;

   public static final String EXPECTED_STARTED_MESSAGE = "Started Application";

   public static final String EXPECTED_CONNECTION_MESSAGE = "successfully connected to server";

   private final Network containersNetwork = Network.newNetwork();

   @Container
   private final McDatabaseContainer dbContainer = new McDatabaseContainer()
            .withNetwork(containersNetwork).withNetworkAliases("db");

   @Container
   private final McBackEndContainer beContainer = new McBackEndContainer()
            .withNetwork(containersNetwork).withNetworkAliases("mc")
            .withCommand("--spring.data.mongodb.host=db")
            .withExposedPorts(MC_LISTENING_PORT);

   private WebTestClient.ResponseSpec response;
   private ListBodySpec<Player> responsePlayerList;

   private void assertThatNoErrorMessagesLogged(final String logs) {
      assertThat(logs, not(containsString("ERROR")));
   }

   private void awaitBeLogMessage(final String message)
            throws TimeoutException {
      final var consumer = new WaitingConsumer();
      beContainer.followOutput(consumer);
      consumer.waitUntil(frame -> frame.getUtf8String().contains(message), 30,
               TimeUnit.SECONDS);
   }

   private void can_get_the_list_of_players() {
      getJson("/api/player", null, null);
      responseIsOk();
      responsePlayerList = response.expectBodyList(Player.class);
   }

   private WebTestClient connectWebTestClient(final String path,
            final String query, final String fragment) {
      final var scheme = "http";
      final String userInfo = null;
      final String host = beContainer.getContainerIpAddress();
      final int port = beContainer.getMappedPort(8080);
      final URI uri;
      try {
         uri = new URI(scheme, userInfo, host, port, path, query, fragment);
      } catch (final URISyntaxException e) {
         throw new IllegalArgumentException(e);
      }
      return WebTestClient.bindToServer().baseUrl(uri.toString()).build();
   }

   @Test
   @Order(2)
   public void getHealthCheck() throws TimeoutException {
      waitUntilReady();
      getJson("/actuator/health", null, null);
      responseIsOk();
      assertThatNoErrorMessagesLogged(beContainer.getLogs());
   }

   @Test
   @Order(2)
   public void getHomePage() throws TimeoutException {
      waitUntilReady();
      getJson("/", null, null);
      responseIsOk();
      assertThatNoErrorMessagesLogged(beContainer.getLogs());
   }

   private void getJson(final String path, final String query,
            final String fragment) {
      response = connectWebTestClient(path, query, fragment).get()
               .accept(MediaType.APPLICATION_JSON).exchange();
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
   @Order(3)
   public void getPlayerDirectory() throws TimeoutException {
      waitUntilReady();
      getJson("/api/player", null, null);

      {
         final var logs = beContainer.getLogs();
         assertThat(logs, not(containsString("requires authentication")));
         assertThat(logs, not(containsString("Exception authenticating")));
         assertThatNoErrorMessagesLogged(logs);
      }
      responseIsOk();
      can_get_the_list_of_players();
      the_list_of_players_has_one_player();
      the_list_of_players_includes_the_administrator();
   }

   private void responseIsOk() {
      response.expectStatus().isOk();
   }

   @Test
   @Order(1)
   public void start() throws TimeoutException {
      waitUntilReady();

      final var logs = beContainer.getLogs();
      assertAll("Log suitable messages",
               () -> assertThat(logs, containsString(EXPECTED_STARTED_MESSAGE)),
               () -> assertThat(logs,
                        containsString(EXPECTED_CONNECTION_MESSAGE)),
               () -> assertThatNoErrorMessagesLogged(logs),
               () -> assertThat(logs, not(containsString("Unable to start"))));
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

   private void waitUntilReady() throws TimeoutException {
      assertTrue(dbContainer.isRunning(), "DB running");
      awaitBeLogMessage(EXPECTED_STARTED_MESSAGE);
      awaitBeLogMessage(EXPECTED_CONNECTION_MESSAGE);
   }
}
