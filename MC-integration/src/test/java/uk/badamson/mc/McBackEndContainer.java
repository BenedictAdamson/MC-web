package uk.badamson.mc;
/*
 * © Copyright Benedict Adamson 2019-20,22.
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

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpCookie;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient.RequestBodySpec;
import org.springframework.test.web.reactive.server.WebTestClient.RequestHeadersSpec;
import org.springframework.test.web.reactive.server.WebTestClient.ResponseSpec;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriTemplate;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.output.WaitingConsumer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.containers.wait.strategy.WaitAllStrategy;
import org.testcontainers.containers.wait.strategy.WaitStrategy;
import org.testcontainers.utility.DockerImageName;
import uk.badamson.mc.rest.Paths;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * <p>
 * A Testcontainers Docker container for the MC-back-end.
 * </p>
 */
final class McBackEndContainer extends GenericContainer<McBackEndContainer> {

    private static final String XSRF_TOKEN_COOKIE_NAME = "XSRF-TOKEN";

    public static final String SESSION_COOKIE_NAME = "JSESSIONID";

    public static final String HEALTHCHECK_PATH = "/actuator/health";

    public static final int PORT = 8080;

    public static final String VERSION = Version.VERSION;

    public static final DockerImageName IMAGE = DockerImageName
            .parse("index.docker.io/benedictadamson/mc-back-end:" + VERSION);

    public static final String STARTED_MESSAGE = "Started Application";

    private static final WaitStrategy WAIT_STRATEGY = new WaitAllStrategy()
            .withStartupTimeout(Duration.ofSeconds(20))
            .withStrategy(Wait.forLogMessage(".*" + STARTED_MESSAGE + ".*", 1));

    public static final String CONNECTION_MESSAGE = "successfully connected to server";

    private static final UriTemplate USER_URI_TEMPLATE = new UriTemplate(
            "/api/user/{user}");

    private static final UriTemplate GAME_URI_TEMPLATE = new UriTemplate(Paths.GAME_PATH_PATTERN);

    private static String encodeAsJson(final Object obj) {
        try {
            final var mapper = new ObjectMapper();
            return mapper.writeValueAsString(obj);
        } catch (final Exception e) {
            throw new IllegalArgumentException("can not encode Object as JSON", e);
        }
    }

    static UUID parseCreateGameResponse(final ResponseSpec response) {
        Objects.requireNonNull(response, "response");

        try {
            final var location = response.returnResult(String.class)
                    .getResponseHeaders().getLocation();
            Objects.requireNonNull(location, "Has Location header");
            final var uriComponents = GAME_URI_TEMPLATE.match(location.getPath());
            return UUID.fromString(uriComponents.get("game"));
        } catch (final NullPointerException e) {
            throw new IllegalArgumentException("Invalid response", e);
        }
    }

    static void secure(final RequestBodySpec request,
                       final BasicUserDetails user,
                       final MultiValueMap<String, HttpCookie> cookies) {
        Objects.requireNonNull(request, "request");
        Objects.requireNonNull(cookies, "cookies");

        final var sessionCookie = cookies.getFirst(SESSION_COOKIE_NAME);
        final var xsrfCookie = cookies.getFirst(XSRF_TOKEN_COOKIE_NAME);
        Objects.requireNonNull(sessionCookie, "sessionCookie");
        Objects.requireNonNull(xsrfCookie, "xsrfCookie");
        if (user != null) {
            request.headers(headers -> headers.setBasicAuth(user.getUsername(), user.getPassword()));
        }
        request.headers(headers -> headers.add("X-XSRF-TOKEN", xsrfCookie.getValue()));
        request.cookie(sessionCookie.getName(), sessionCookie.getValue());
        request.cookie(xsrfCookie.getName(), xsrfCookie.getValue());
    }

    private final User administrator;

    @SuppressWarnings("resource")
    McBackEndContainer(final String mongoDbHost, final String mongoDbPassword,
                       final String administratorPassword) {
        super(IMAGE);
        administrator = User.createAdministrator(administratorPassword);
        waitingFor(WAIT_STRATEGY);
        withEnv("SPRING_DATA_MONGODB_PASSWORD", mongoDbPassword);
        withEnv("ADMINISTRATOR_PASSWORD", administratorPassword);
        withCommand("--spring.data.mongodb.host=" + mongoDbHost);
        addExposedPort(PORT);
    }

    public UUID addUser(final BasicUserDetails userDetails) {
        try {
            Objects.requireNonNull(userDetails, "userDetails");

            final var cookies = login(administrator);
            final var headers = connectWebTestClient("/api/user").post()
                    .contentType(MediaType.APPLICATION_JSON);
            secure(headers, administrator, cookies);
            final var request = headers.bodyValue(encodeAsJson(userDetails));

            final var response = request.exchange();
            response.expectStatus().isFound();
            final var location = response.returnResult(Void.class)
                    .getResponseHeaders().getLocation();
            assertNotNull(location, "response has Location header");// guard
            final var id = UUID.fromString(
                    USER_URI_TEMPLATE.match(location.toString()).get("user"));
            logout(administrator, cookies);
            return id;
        } catch (final Exception e) {
            throw new RuntimeException("Failed to add user", e);
        }
    }

    void assertHealthCheckOk() {
        getJson(HEALTHCHECK_PATH).expectStatus().isOk();
    }

    void awaitLogMessage(final String message) throws TimeoutException {
        final var consumer = new WaitingConsumer();
        followOutput(consumer);
        consumer.waitUntil(frame -> frame.getUtf8String().contains(message), 30,
                TimeUnit.SECONDS);
    }

    public WebTestClient connectWebTestClient(final String path) {
        return connectWebTestClient(path, null);
    }

    private WebTestClient connectWebTestClient(final String path, final String query) {
        final var scheme = "http";
        final var host = getHost();
        final int port = getMappedPort(PORT);
        final URI uri;
        try {
            uri = new URI(scheme, null, host, port, path, query, null);
        } catch (final URISyntaxException e) {
            throw new IllegalArgumentException(e);
        }
        return WebTestClient.bindToServer().baseUrl(uri.toString()).build();
    }

    RequestBodySpec createCreateGameRequest(final UUID scenario, final User user,
                                            final MultiValueMap<String, HttpCookie> cookies) {
        Objects.requireNonNull(cookies, "cookies");

        final var path = Paths.createPathForGamesOfScenario(scenario);
        final var request = connectWebTestClient(path).post()
                .accept(MediaType.APPLICATION_JSON);
        secure(request, user, cookies);
        return request;
    }

    public UUID createGame(final UUID scenario) {
        Objects.requireNonNull(scenario, "scenario");

        final var cookies = login(administrator);
        final var request = createCreateGameRequest(scenario, administrator,
                cookies);
        final var response = request.exchange();
        logout(administrator, cookies);

        response.expectStatus().isFound();
        return parseCreateGameResponse(response);
    }

    RequestHeadersSpec<?> createGetSelfRequest(final String username,
                                               final String password) {
        return connectWebTestClient("/api/self").get()
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBasicAuth(username, password));
    }

    private RequestBodySpec createJoinGameRequest(final UUID game,
                                                  final User user, final MultiValueMap<String, HttpCookie> cookies) {
        Objects.requireNonNull(game, "game");
        Objects.requireNonNull(user, "user");
        Objects.requireNonNull(cookies, "cookies");

        final var path = Paths.createPathForGame(game);
        final var query = "join";
        final var request = connectWebTestClient(path, query).post()
                .accept(MediaType.APPLICATION_JSON);
        secure(request, user, cookies);
        return request;
    }

    private RequestBodySpec createStartGameRequest(final UUID game,
                                                   final User user, final MultiValueMap<String, HttpCookie> cookies) {
        Objects.requireNonNull(game, "game");
        Objects.requireNonNull(user, "user");
        Objects.requireNonNull(cookies, "cookies");

        final var path = Paths.createPathForGame(game);
        final var query = "start";
        final var request = connectWebTestClient(path, query).post()
                .accept(MediaType.APPLICATION_JSON);
        secure(request, user, cookies);
        return request;
    }

    public User getAdministrator() {
        return administrator;
    }

    public Stream<NamedUUID> getGameIds(final UUID scenario, User user) {
        final var response = getGameIdsResponse(scenario, user);
        response.expectStatus().isOk();
        return response.returnResult(uk.badamson.mc.rest.NamedUUID.class).getResponseBody().toStream()
                .map(ni -> new NamedUUID(ni.getId(), ni.getTitle()));
    }

    ResponseSpec getGameIdsResponse(final UUID scenario, User user) {
        return getJsonAsAdministrator(Paths.createPathForGamesOfScenario(scenario));
    }

    private WebTestClient.ResponseSpec getJson(final String path) {
        return connectWebTestClient(path).get().accept(MediaType.APPLICATION_JSON)
                .exchange();
    }

    public WebTestClient.ResponseSpec getJsonAsAdministrator(final String path) {
        return getJsonAsUser(path, administrator);
    }

    public WebTestClient.ResponseSpec getJsonAsUser(final String path, User user) {
        return connectWebTestClient(path).get().accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBasicAuth(
                        user.getUsername(),
                        user.getPassword()))
                .exchange();
    }

    public Stream<NamedUUID> getScenarios() {
        return getJson("/api/scenario").returnResult(uk.badamson.mc.rest.NamedUUID.class)
                .getResponseBody().toStream().map(ni -> new NamedUUID(ni.getId(), ni.getTitle()));
    }

    public void joinGame(final UUID game, final User user) {
        Objects.requireNonNull(game, "game");
        Objects.requireNonNull(user, "user");

        final var cookies = login(user);
        final var request = createJoinGameRequest(game, user, cookies);
        final var response = request.exchange();
        logout(user, cookies);

        response.expectStatus().isFound();
    }

    MultiValueMap<String, HttpCookie> login(final BasicUserDetails user) {
        final var request = createGetSelfRequest(user.getUsername(),
                user.getPassword());

        final var response = request.exchange();

        final var cookies = response.returnResult(String.class)
                .getResponseCookies();
        if (!cookies.containsKey(SESSION_COOKIE_NAME)
                || !cookies.containsKey(XSRF_TOKEN_COOKIE_NAME)) {
            throw new IllegalStateException(
                    "Cookies missing from response " + cookies);
        }
        final MultiValueMap<String, HttpCookie> result = new LinkedMultiValueMap<>();
        cookies.forEach(result::addAll);
        return result;
    }

    void logout(final User user,
                final MultiValueMap<String, HttpCookie> cookies) {
        final var request = connectWebTestClient("/logout").post();
        secure(request, user, cookies);
        final var response = request.exchange();
        response.expectStatus().is2xxSuccessful();
    }

    public void startGame(final UUID game) {
        Objects.requireNonNull(game, "game");

        final var cookies = login(administrator);
        final var request = createStartGameRequest(game, administrator, cookies);
        final var response = request.exchange();
        logout(administrator, cookies);

        response.expectStatus().isFound();
    }
}
