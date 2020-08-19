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

import java.time.Duration;

import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
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

   private static final String ADMIN_PASSWORD = "letmein";

   private static final Duration STARTUP_TIME = Duration.ofMillis(100);

   private static final WaitStrategy WAIT_STRATEGY = Wait.forListeningPort();

   public McAuthContainer() {
      super(IMAGE);
      addExposedPort(PORT);
      withEnv("KEYCLOAK_PASSWORD", ADMIN_PASSWORD);
      withEnv("DB_PASSWORD", DB_PASSWORD);
      withNetworkAliases(HOST);
      withMinimumRunningDuration(STARTUP_TIME);
      waitingFor(WAIT_STRATEGY);
   }

}
