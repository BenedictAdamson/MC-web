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

import static java.util.stream.Collectors.toList;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.stream.Stream;

import org.springframework.http.HttpCookie;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient.RequestHeadersSpec;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriTemplate;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.output.WaitingConsumer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.containers.wait.strategy.WaitAllStrategy;
import org.testcontainers.containers.wait.strategy.WaitStrategy;

import com.fasterxml.jackson.databind.ObjectMapper;

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

   private static final WaitStrategy WAIT_STRATEGY = new WaitAllStrategy()
            .withStartupTimeout(Duration.ofSeconds(20))
            .withStrategy(Wait.forLogMessage(".*" + STARTED_MESSAGE + ".*", 1));

   public static final String CONNECTION_MESSAGE = "successfully connected to server";

   private static final UriTemplate GAME_URI_TEMPLATE = new UriTemplate(
            "/api/scenario/{scenario}/game/{game}");

   public static void addCookies(final MultiValueMap<String, String> dst,
            final Collection<? extends HttpCookie> src) {
      src.forEach(cookie -> dst.add(cookie.getName(), cookie.getValue()));
   }

   private static String encodeAsJson(final Object obj) {
      try {
         final var mapper = new ObjectMapper();
         return mapper.writeValueAsString(obj);
      } catch (final Exception e) {
         throw new IllegalArgumentException("can not encode Object as JSON", e);
      }
   }

   private final User administrator;

   McBackEndContainer(final String mongoDbHost, final String mongoDbPassword,
            final String administratorPassword) {
      super(IMAGE);
      administrator = new User(User.ADMINISTRATOR_USERNAME,
               administratorPassword, Authority.ALL, true, true, true, true);
      waitingFor(WAIT_STRATEGY);
      withEnv("SPRING_DATA_MONGODB_PASSWORD", mongoDbPassword);
      withEnv("ADMINISTRATOR_PASSWORD", administratorPassword);
      withCommand("--spring.data.mongodb.host=" + mongoDbHost);
   }

   public void addUser(final User user) {
      try {
         Objects.requireNonNull(user, "user");

         final var cookies = login(administrator);
         final var request = connectWebTestClient("/api/user").post()
                  .contentType(MediaType.APPLICATION_JSON)
                  .cookies(cookiesMultiMap -> addCookies(cookiesMultiMap,
                           cookies))
                  .headers(headers -> headers.setBasicAuth(
                           administrator.getUsername(),
                           administrator.getPassword()))
                  .bodyValue(encodeAsJson(user));

         final var response = request.exchange();
         response.expectStatus().is2xxSuccessful();
         logout(administrator, cookies);
      } catch (final Exception e) {
         throw new RuntimeException("Failed to add user", e);
      }
   }

   void assertHealthCheckOk() {
      getJson(HEALTHCHECK_PATH).expectStatus().isOk();
   }

   void awaitHealthCheckOk() throws TimeoutException, InterruptedException {
      var tries = 0;
      var sleep = 50;
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

   public WebTestClient connectWebTestClient(final String path) {
      final var scheme = "http";
      final String userInfo = null;
      final String query = null;
      final String fragment = null;
      final var host = getContainerIpAddress();
      final int port = getMappedPort(PORT);
      final URI uri;
      try {
         uri = new URI(scheme, userInfo, host, port, path, query, fragment);
      } catch (final URISyntaxException e) {
         throw new IllegalArgumentException(e);
      }
      return WebTestClient.bindToServer().baseUrl(uri.toString()).build();
   }

   public Game.Identifier createGame(final UUID scenario) {
      Objects.requireNonNull(scenario, "scenario");
      final var path = "/api/scenario/" + scenario + "/game";
      final var response = connectWebTestClient(path).post()
               .accept(MediaType.APPLICATION_JSON).exchange();
      response.expectStatus().isFound();
      final var location = response.returnResult(String.class)
               .getResponseHeaders().getLocation();
      final var uriComponents = GAME_URI_TEMPLATE.match(location.getPath());
      final var created = Instant.parse(uriComponents.get("game"));
      return new Game.Identifier(scenario, created);
   }

   RequestHeadersSpec<?> createGetSelfRequest(final String username,
            final String password) {
      return connectWebTestClient("/api/self").get()
               .accept(MediaType.APPLICATION_JSON)
               .headers(headers -> headers.setBasicAuth(username, password));
   }

   public User getAdministrator() {
      return administrator;
   }

   private WebTestClient.ResponseSpec getJson(final String path) {
      return connectWebTestClient(path).get().accept(MediaType.APPLICATION_JSON)
               .exchange();
   }

   public WebTestClient.ResponseSpec getJsonAsAdministrator(final String path) {
      return connectWebTestClient(path).get().accept(MediaType.APPLICATION_JSON)
               .headers(headers -> headers.setBasicAuth(
                        administrator.getUsername(),
                        administrator.getPassword()))
               .exchange();
   }

   public Stream<NamedUUID> getScenarios() {
      return getJson("/api/scenario").returnResult(NamedUUID.class)
               .getResponseBody().toStream();
   }

   Collection<HttpCookie> login(final User user) {
      final var request = createGetSelfRequest(user.getUsername(),
               user.getPassword());

      final var response = request.exchange();

      final var result = response.returnResult(String.class);
      final var cookies = result.getResponseCookies();
      return cookies.values().stream()
               .flatMap(cookieList -> cookieList.stream()).collect(toList());
   }

   private void logout(final User user, final Collection<HttpCookie> cookies) {
      final var request = connectWebTestClient("/logout").post()
               .headers(headers -> headers.setBasicAuth(user.getUsername(),
                        user.getPassword()))
               .cookies(map -> addCookies(map, cookies));
      final var response = request.exchange();
      response.expectStatus().is2xxSuccessful();
   }
}
