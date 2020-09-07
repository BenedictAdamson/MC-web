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

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;

import org.keycloak.admin.client.Keycloak;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.containers.wait.strategy.WaitAllStrategy;
import org.testcontainers.containers.wait.strategy.WaitStrategy;
import org.testcontainers.containers.Container;

import uk.badamson.mc.Version;

/**
 * <p>
 * A Testcontainers Docker container for the MC-auth image.
 * </p>
 */
public final class McAuthContainer extends GenericContainer<McAuthContainer> {
   private static final String KCADM = "/opt/jboss/keycloak/bin/kcadm.sh";

   public static final String VERSION = Version.VERSION;

   public static final String IMAGE = "index.docker.io/benedictadamson/mc-auth:"
            + VERSION;

   public static final int PORT = 8080;

   public static final String DB_USER = "keycloak";
   public static final String DB_NAME = "keycloak";
   public static final String MC_REALM = "MC";
   public static final String MC_CLIENT_ID = "mc-ui";
   public static final String REALM_MANAGEMENT_CLIENT_ID = "realm-management";

   private static final Duration STARTUP_TIME = Duration.ofSeconds(180);

   private static final WaitStrategy WAIT_STRATEGY = new WaitAllStrategy()
            .withStartupTimeout(STARTUP_TIME)
            .withStrategy(Wait.forListeningPort()).withStrategy(
                     Wait.forLogMessage(".*[Aa]dmin console listening.*", 1));

   public McAuthContainer(String keycloakPassword, String dbVendor,
            String dbAddr, String dbPassword) {
      super(IMAGE);
      addExposedPort(PORT);
      withEnv("KEYCLOAK_PASSWORD", keycloakPassword);
      withEnv("DB_VENDOR", dbVendor);
      withEnv("DB_ADDR", dbAddr);
      withEnv("DB_PASSWORD", dbPassword);
      waitingFor(WAIT_STRATEGY);
   }

   private void requireSuccess(Container.ExecResult result) {
      if (result.getExitCode() != 0) {
         final String message = result.getStderr() + "\n" + result.getStdout();
         throw new IllegalStateException(message);
      }
   }

   public void addPlayer(String user, String password) {
      try {
         requireSuccess(execInContainer(KCADM, "create", "users", "-r",
                  MC_REALM, "-s", "username=" + user, "-s", "enabled=true"));
         requireSuccess(execInContainer(KCADM, "set-password", "-r", MC_REALM,
                  "--username", user, "--new-password", password));
         requireSuccess(execInContainer(KCADM, "add-roles", "-r", MC_REALM,
                  "--uusername", user, "--rolename", "player"));
      } catch (IOException | InterruptedException e) {
         throw new RuntimeException("Failed to add player", e);
      }
   }

   public Keycloak getKeycloakInstance(String user, String password,
            String client) {
      return Keycloak.getInstance(getUri().toASCIIString(), MC_REALM, user,
               password, client);
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
