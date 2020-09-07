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

import java.net.URI;
import java.net.URISyntaxException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.output.WaitingConsumer;

/**
 * <p>
 * A Testcontainers Docker container for the MC-back-end.
 * </p>
 */
final class McBackEndContainer extends GenericContainer<McBackEndContainer> {

   public static final String HEALTHCHECK_PATH = "/actuator/health";

   public static final int PORT = 8080;

   public static final String VERSION = Version.VERSION;

   public static final String IMAGE = "index.docker.io/benedictadamson/mc-back-end:"
            + VERSION;

   public static final String STARTED_MESSAGE = "Started Application";

   public static final String CONNECTION_MESSAGE = "successfully connected to server";

   McBackEndContainer(String mongoDbHost, String mongoDbPassword) {
      super(IMAGE);
      withEnv("SPRING_DATA_MONGODB_PASSWORD",
               mongoDbPassword);
      withCommand("--spring.data.mongodb.host=" + mongoDbPassword);
   }

   void assertHealthCheckOk() {
      getJson(HEALTHCHECK_PATH).expectStatus().isOk();
   }

   void awaitHealthCheckOk() throws TimeoutException, InterruptedException {
      int tries = 0;
      int sleep = 50;
      while (true) {
         tries++;
         try {
            assertHealthCheckOk();
            return;
         } catch (final AssertionError e) {
            if (20 <= tries) {
               throw (TimeoutException) new TimeoutException().initCause(e);
            } else {
               Thread.sleep(sleep);
               sleep = sleep < 500 ? sleep * 2 : sleep;
            }
         }
      }
   }

   void awaitLogMessage(final String message) throws TimeoutException {
      final var consumer = new WaitingConsumer();
      followOutput(consumer);
      consumer.waitUntil(frame -> frame.getUtf8String().contains(message), 30,
               TimeUnit.SECONDS);
   }

   private WebTestClient connectWebTestClient(final String path) {
      final var scheme = "http";
      final String userInfo = null;
      final String query = null;
      final String fragment = null;
      final String host = getContainerIpAddress();
      final int port = getMappedPort(PORT);
      final URI uri;
      try {
         uri = new URI(scheme, userInfo, host, port, path, query, fragment);
      } catch (final URISyntaxException e) {
         throw new IllegalArgumentException(e);
      }
      return WebTestClient.bindToServer().baseUrl(uri.toString()).build();
   }

   WebTestClient.ResponseSpec getJson(final String path) {
      return connectWebTestClient(path).get().accept(MediaType.APPLICATION_JSON)
               .exchange();
   }

   void waitUntilReady() throws TimeoutException, InterruptedException {
      awaitLogMessage(STARTED_MESSAGE);
      awaitLogMessage(CONNECTION_MESSAGE);
      awaitHealthCheckOk();
   }
}
