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
import static org.hamcrest.Matchers.*;
import static org.hamcrest.MatcherAssert.assertThat;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.testcontainers.containers.Network;
import org.testcontainers.junit.jupiter.Testcontainers;

import uk.badamson.mc.auth.McAuthContainer;
import uk.badamson.mc.auth.McAuthInitContainer;
import uk.badamson.mc.repository.AuthDbContainer;

/**
 * <p>
 * Basic system test for the MC-auth Docker image, testing it operating with a
 * database server.
 * </p>
 */
@TestMethodOrder(OrderAnnotation.class)
@Testcontainers
@Tag("IT")
public class AuthSubSystemIT implements AutoCloseable {

   private static final String AUTH_HOST = "auth";
   private static final String AUTH_DB_HOST = "auth-db";

   private static final String AUTH_DB_PASSWORD = "secret1";
   private static final String KEYCLOAK_PASSWORD = "secret4";

   private final Network network = Network.newNetwork();

   private final AuthDbContainer authDb = new AuthDbContainer(AUTH_DB_PASSWORD)
            .withNetwork(network).withNetworkAliases(AUTH_DB_HOST);

   private final McAuthContainer auth = new McAuthContainer(KEYCLOAK_PASSWORD,
            AuthDbContainer.KEYCLOAK_DB_VENDOR, AUTH_DB_HOST, AUTH_DB_PASSWORD)
                     .withNetwork(network).withNetworkAliases(AUTH_HOST);

   private final McAuthInitContainer authInit = new McAuthInitContainer(
            KEYCLOAK_PASSWORD, AUTH_HOST, McAuthContainer.PORT)
                     .withNetwork(network);

   private void assertThatNoErrorMessages(final String logs) {
      assertThat(logs, not(containsString("ERROR")));
   }

   @Override
   public void close() {
      authInit.close();
      auth.close();
      authDb.close();
      network.close();
   }

   @BeforeEach
   public void start() {
      authDb.start();
      auth.start();
      authInit.start();
   }

   @Test
   @Order(1)
   public void startUp() {
      assertThatNoErrorMessages(auth.getLogs());
   }

   /**
    * The <i>List users</i> scenario requires that a user with the "player" role
    * is permitted to list users.
    */
   @Test
   @Order(2)
   public void listUsersAsPlayer() {
      final var user = "Jeff";
      final var password = "letmein";
      auth.addPlayer(user, password);
      try (var keycloak = auth.getKeycloakInstance(user, password)) {
         var users = keycloak.realm(McAuthContainer.MC_REALM).users().list();
         assertThat(users, not(empty()));
      }
      assertThatNoErrorMessages(auth.getLogs());
   }

   @AfterEach
   public void stop() {
      authInit.stop();
      auth.stop();
      authDb.stop();
      close();
   }
}
