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
import static org.hamcrest.Matchers.empty;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.keycloak.representations.idm.RealmRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.testcontainers.containers.Network;
import org.testcontainers.junit.jupiter.Testcontainers;

import uk.badamson.mc.auth.McAuthContainer;
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
public class AuthServerWithAuthDbIT implements AutoCloseable {

   private final Network containersNetwork = Network.newNetwork();

   private final AuthDbContainer dbContainer = new AuthDbContainer()
            .withNetwork(containersNetwork);

   private final McAuthContainer authContainer = new McAuthContainer()
            .withNetwork(containersNetwork).withEnv("DB_VENDOR", "mariadb")
            .withEnv("DB_ADDR", AuthDbContainer.HOST);

   private void assertThatNoErrorMessages(final String logs) {
      assertThat(logs, not(containsString("ERROR")));
   }

   @Override
   public void close() {
      authContainer.close();
      dbContainer.close();
      containersNetwork.close();
   }

   /**
    * The <i>Get users of fresh instance</i> scenario requires that a fresh
    * instance of MC has a list of users that has at least one user.
    */
   @Test
   @Order(2)
   public void listUsers() {
      try (var keycloak = authContainer.getKeycloakInstance()) {
         final List<RealmRepresentation> realms;
         try {
            realms = keycloak.realms().findAll();
         } catch (final Exception e) {// provide better diagnostics
            throw new AssertionError("Able to list realms", e);
         }
         assertThat(realms, not(empty()));
         final var realm = keycloak.realm(McAuthContainer.MC_REALM);
         final List<UserRepresentation> users;
         try {
            users = realm.users().list();
         } catch (final Exception e) {// provide better diagnostics
            throw new AssertionError("Able to list users in realm", e);
         }
         assertThat(users, not(empty()));
      }
   }

   @BeforeEach
   public void start() {
      dbContainer.start();
      authContainer.start();
   }

   @Test
   @Order(1)
   public void startUp() {
      assertThatNoErrorMessages(authContainer.getLogs());
   }

   @AfterEach
   public void stop() {
      authContainer.stop();
      dbContainer.stop();
      close();
   }
}
