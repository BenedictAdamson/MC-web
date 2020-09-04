package uk.badamson.mc.auth;
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
import java.net.URISyntaxException;
import java.time.Duration;

import org.keycloak.admin.client.Keycloak;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.containers.wait.strategy.WaitAllStrategy;
import org.testcontainers.containers.wait.strategy.WaitStrategy;

import uk.badamson.mc.Version;

/**
 * <p>
 * A Testcontainers Docker container for the MC-auth image.
 * </p>
 */
public final class McAuthContainer extends GenericContainer<McAuthContainer> {
   public static final String VERSION = Version.VERSION;

   public static final String IMAGE = "index.docker.io/benedictadamson/mc-auth:"
            + VERSION;

   public static final int PORT = 8080;

   public static final String HOST = "auth";

   public static final String DB_USER = "keycloak";
   public static final String DB_NAME = "keycloak";
   public static final String DB_PASSWORD = "password123";
   public static final String MC_REALM = "MC";
   public static final String MC_CLIENT_ID = "mc-ui";

   private static final String ADMIN_USER = "admin";
   private static final String ADMIN_PASSWORD = "letmein";
   private static final String ADMIN_REALM = MC_REALM;
   private static final String ADMIN_CLIENT_ID = MC_CLIENT_ID;

   private static final Duration STARTUP_TIME = Duration.ofSeconds(180);

   private static final WaitStrategy WAIT_STRATEGY = new WaitAllStrategy()
            .withStartupTimeout(STARTUP_TIME)
            .withStrategy(Wait.forListeningPort()).withStrategy(
                     Wait.forLogMessage(".*[Aa]dmin console listening.*", 1));

   public McAuthContainer() {
      super(IMAGE);
      addExposedPort(PORT);
      withEnv("KEYCLOAK_PASSWORD", ADMIN_PASSWORD);
      withEnv("DB_PASSWORD", DB_PASSWORD);
      withNetworkAliases(HOST);
      waitingFor(WAIT_STRATEGY);
   }

   public Keycloak getKeycloakInstance() {
      return Keycloak.getInstance(getUri().toASCIIString(), ADMIN_REALM,
               ADMIN_USER, ADMIN_PASSWORD, ADMIN_CLIENT_ID);
   }

   private URI getUri() {
      try {
         return new URI("http", null, getHost(), getFirstMappedPort(), "/auth",
                  null, null);
      } catch (final URISyntaxException e) {// never happens
         throw new IllegalStateException(e);
      }
   }
}
