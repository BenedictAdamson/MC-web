package uk.badamson.mc.auth;
/*
 * © Copyright Benedict Adamson 2020.
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
import org.testcontainers.containers.startupcheck.OneShotStartupCheckStrategy;
import org.testcontainers.containers.startupcheck.StartupCheckStrategy;

import uk.badamson.mc.Version;

/**
 * <p>
 * A Testcontainers Docker container for the MC-auth-init image.
 * </p>
 */
public final class McAuthInitContainer
         extends GenericContainer<McAuthInitContainer> {
   public static final String VERSION = Version.VERSION;

   public static final String IMAGE = "index.docker.io/benedictadamson/mc-auth-init:"
            + VERSION;

   private static final StartupCheckStrategy STARTUP_CHECK_STRATEGY = new OneShotStartupCheckStrategy()
            .withTimeout(Duration.ofSeconds(180));

   public McAuthInitContainer(final String keycloakPassword,
            final String keycloakHost, final int keycloakPort) {
      super(IMAGE);
      withStartupCheckStrategy(STARTUP_CHECK_STRATEGY);
      withEnv("KEYCLOAK_PASSWORD", keycloakPassword);
      withCommand(keycloakHost, String.valueOf(keycloakPort));
   }
}
