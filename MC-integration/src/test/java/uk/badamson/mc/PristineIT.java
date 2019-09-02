package uk.badamson.mc;
/*
 * © Copyright Benedict Adamson 2019.
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
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient.ResponseSpec;
import org.testcontainers.containers.DockerComposeContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * <p>
 * Basic system test for MC, testing it operating as a pristine (fresh)
 * installation.
 * </p>
 */
@Testcontainers
public class PristineIT {

   public static final int FRONT_END_LISTENING_PORT = 80;

   public static final String FRONT_END_SERVICE_NAME = "fe";

   public static final Path DOCKER_COMPOSE_FILE = Paths
            .get("docker-compose.yml");

   private static final String SUT_VERSION;
   static {
      SUT_VERSION = System.getProperty("sutVersion", "");
      if (SUT_VERSION == null || SUT_VERSION.isEmpty()) {
         throw new IllegalStateException("sutVersion property not set");
      }
   }

   @Container
   private final DockerComposeContainer<?> mcContainer = new DockerComposeContainer<>(
            DOCKER_COMPOSE_FILE.toFile()).withEnv("VERSION", SUT_VERSION)
                     .withExposedService(FRONT_END_SERVICE_NAME,
                              FRONT_END_LISTENING_PORT,
                              Wait.forListeningPort().withStartupTimeout(
                                       Duration.ofSeconds(30)));

   private WebTestClient connectWebTestClient(final String path,
            final String query, final String fragment) {
      final var scheme = "http";
      final String userInfo = null;
      final String host = mcContainer.getServiceHost(FRONT_END_SERVICE_NAME,
               FRONT_END_LISTENING_PORT);
      final int port = mcContainer.getServicePort(FRONT_END_SERVICE_NAME,
               FRONT_END_LISTENING_PORT);
      final URI uri;
      try {
         uri = new URI(scheme, userInfo, host, port, path, query, fragment);
      } catch (final URISyntaxException e) {
         throw new IllegalArgumentException(e);
      }
      return WebTestClient.bindToServer().baseUrl(uri.toString()).build();
   }

   @Test
   public void getHomePage() {
      final var response = getJson("/", null, null);

      response.expectStatus().isOk();
   }

   private ResponseSpec getJson(final String path, final String query,
            final String fragment) {
      return connectWebTestClient(path, query, fragment).get()
               .accept(MediaType.APPLICATION_JSON_UTF8).exchange();
   }

   @Test
   public void getPlayerDirectory() {
      final var response = getJson("/player", null, null);

      response.expectStatus().isOk();
   }
}
