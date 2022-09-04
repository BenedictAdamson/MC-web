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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.opentest4j.AssertionFailedError;
import org.springframework.http.HttpCookie;
import org.springframework.test.web.reactive.server.WebTestClient.ResponseSpec;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.testcontainers.containers.Network;
import uk.badamson.mc.repository.McDatabaseContainer;
import uk.badamson.mc.rest.AuthorityValue;
import uk.badamson.mc.rest.GameIdentifierResponse;
import uk.badamson.mc.rest.UserResponse;

import javax.annotation.Nonnull;
import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeoutException;

import static java.util.stream.Collectors.toList;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * <p>
 * Basic system test for the MC database and MC backend containers operating
 * together, testing it operating as a pristine (fresh) installation.
 * </p>
 * <p>
 * These tests demonstrate that it is possible to configure the back-end to
 * communicate correctly with the database. They do not really demonstrate
 * specific correct functionality.
 * </p>
 */
@TestMethodOrder(OrderAnnotation.class)
@Tag("IT")
public class BeWithDbSubSystemIT {

    @Nested
    public class CreateGame {

        @Nested
        public class Valid {

            @Test
            public void administrator() {
                final Optional<NamedUUID> namedUUIDOptional = be.getScenarios().findAny();
                assertThat("namedUUID", namedUUIDOptional.isPresent());
                final var scenarioId = namedUUIDOptional.get().getId();
                test(scenarioId, be.getAdministrator());
            }

            private void test(final UUID scenario, final User user) {
                Objects.requireNonNull(user, "user");
                final var response = exchange(scenario, user);

                response.expectStatus().isFound();
                final var gameId = McBackEndContainer.parseCreateGameResponse(response);
                final var gameIds = be.getGameIds(scenario, user).collect(toList());
                assertThat(GameIdentifierResponse.convertToResponse(gameId), in(gameIds));
            }

        }

        private ResponseSpec exchange(final UUID scenario, final User user) {
            Objects.requireNonNull(scenario, "scenario");

            final var cookies = user == null ? NO_COOKIES : be.login(user);
            final var request = be.createCreateGameRequest(scenario, user,
                    cookies);
            final var response = request.exchange();
            if (user != null) {
                be.logout(user, cookies);
            }

            return response;
        }
    }

    @Nested
    public class GetSelf {
        @Test
        @Order(2)
        public void administrator() {
            final var user = be.getAdministrator();
            final var request = be.createGetSelfRequest(user.getUsername(),
                    user.getPassword());

            final var response = request.exchange();

            assertSelfResponseEquivalent(user, true, response);
        }

        @Test
        @Order(4)
        public void twiceWithoutSessionCookie() {
            final var user = createBasicUserDetails();
            final var username = user.getUsername();
            final var password = user.getPassword();
            be.addUser(user);
            final var response1 = be.createGetSelfRequest(username, password)
                    .exchange();
            final var sessionCookie1 = response1.returnResult(String.class)
                    .getResponseCookies()
                    .getFirst(McBackEndContainer.SESSION_COOKIE_NAME);
            assertThat(sessionCookie1, notNullValue());
            final var sessionCookieValue1 = sessionCookie1.getValue();

            final var request2 = be.createGetSelfRequest(username, password);
            final var response2 = request2.exchange();
            final var sessionCookie2 = response2.returnResult(String.class)
                    .getResponseCookies()
                    .getFirst(McBackEndContainer.SESSION_COOKIE_NAME);
            assertThat(sessionCookie2, notNullValue());
            final var sessionCookieValue2 = sessionCookie2.getValue();

            assertNotEquals(sessionCookieValue1, sessionCookieValue2,
                    "Different session cookies");
        }

        @Test
        @Order(4)
        public void twiceWithSessionCookie() {
            final var user = createBasicUserDetails();
            final var username = user.getUsername();
            final var password = user.getPassword();
            be.addUser(user);
            final var response1 = be.createGetSelfRequest(username, password)
                    .exchange();
            final var sessionCookie = response1.returnResult(String.class)
                    .getResponseCookies()
                    .getFirst(McBackEndContainer.SESSION_COOKIE_NAME);
            assertThat(sessionCookie, notNullValue());
            final var sessionCookieValue = sessionCookie.getValue();

            final var request2 = be.createGetSelfRequest(username, password);
            request2.cookie(McBackEndContainer.SESSION_COOKIE_NAME, sessionCookieValue);
            final var response2 = request2.exchange();

            assertSelfResponseEquivalent(user, false, response2);
        }

        @Test
        @Order(1)
        public void unknownUser() {
            final var user = createBasicUserDetails();
            final var request = be.createGetSelfRequest(user.getUsername(),
                    user.getPassword());

            final var response = request.exchange();

            response.expectStatus().isUnauthorized();
        }

        @Test
        @Order(3)
        public void valid() {
            final var user = createBasicUserDetails();
            be.addUser(user);
            final var request = be.createGetSelfRequest(user.getUsername(),
                    user.getPassword());

            final var response = request.exchange();

            assertSelfResponseEquivalent(user, true, response);
        }

        @Test
        @Order(1)
        public void wrongPassword() {
            final var user = createBasicUserDetails();
            be.addUser(user);
            final var request = be.createGetSelfRequest(user.getUsername(),
                    "*" + user.getPassword());

            final var response = request.exchange();

            response.expectStatus().is4xxClientError();
        }

    }

    @Nested
    public class Logout {

        @Test
        @Order(1)
        public void administratorNoSession() {
            final var user = be.getAdministrator();
            final var request = be.connectWebTestClient("/logout").post()
                    .headers(headers -> headers.setBasicAuth(user.getUsername(),
                            user.getPassword()));

            final var response = request.exchange();

            response.expectStatus().isForbidden();
        }

        @Test
        @Order(2)
        public void administratorWithSession() {
            final var user = be.getAdministrator();
            final var cookies = be.login(user);
            final var request = be.connectWebTestClient("/logout").post();
            McBackEndContainer.secure(request, user, cookies);

            final var response = request.exchange();

            response.expectStatus().isNoContent();
        }

        @Test
        @Order(1)
        public void noSession() {
            final var user = createBasicUserDetails();
            be.addUser(user);
            final var request = be.connectWebTestClient("/logout").post()
                    .headers(headers -> headers.setBasicAuth(user.getUsername(),
                            user.getPassword()));

            final var response = request.exchange();

            response.expectStatus().isForbidden();
        }

        @Test
        @Order(3)
        public void withSession() {
            final var user = createBasicUserDetails();
            be.addUser(user);
            final var cookies = be.login(user);
            final var request = be.connectWebTestClient("/logout").post();
            McBackEndContainer.secure(request, user, cookies);

            final var response = request.exchange();

            response.expectStatus().isNoContent();
        }

        @Test
        @Order(1)
        public void wrongPassword() {
            final var user = createBasicUserDetails();
            be.addUser(user);
            final var request = be.connectWebTestClient("/logout").post()
                    .headers(headers -> headers.setBasicAuth(user.getUsername(),
                            "*" + user.getPassword()));

            final var response = request.exchange();

            response.expectStatus().is4xxClientError();
        }

    }

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private static final MultiValueMap<String, HttpCookie> NO_COOKIES = new LinkedMultiValueMap<>();

    private static final String BE_HOST = "be";

    private static final String DB_HOST = "db";
    private static final String DB_ROOT_PASSWORD = "secret2";
    private static final String DB_USER_PASSWORD = "secret3";

    private static final String ADMINISTRATOR_PASSWORD = "secret4";

    private static void assertSelfResponseEquivalent(
            @Nonnull final BasicUserDetails expectedUser,
            final boolean expectSetSessionCookie,
            @Nonnull final ResponseSpec response) {
        final var result = response.returnResult(String.class);
        final var responseJson = result.getResponseBody()
                .blockFirst(Duration.ofSeconds(9));
        final UserResponse responseUser;
        try {
            responseUser = OBJECT_MAPPER.readValue(responseJson, UserResponse.class);
        } catch (final JsonProcessingException e) {
            throw new AssertionFailedError("Response has valid JSON", e);
        }
        final var cookies = result.getResponseCookies();
        assertAll(() -> response.expectStatus().isOk(),
                () -> assertThat("response username", responseUser.username(),
                        is(expectedUser.getUsername())),
                () -> assertThat("response authorities",
                        responseUser.authorities(),
                        is(AuthorityValue.convertToValue(expectedUser.getAuthorities()))),
                () -> assertThat("Sets session cookie", cookies,
                        expectSetSessionCookie ? hasKey("JSESSIONID")
                                : not(hasKey("JSESSIONID"))),
                () -> assertThat("Sets CSRF protection cookie", cookies,
                        hasKey("XSRF-TOKEN")));
    }

    private static final Network network = Network.newNetwork();

    private static final McDatabaseContainer db = new McDatabaseContainer(
            DB_ROOT_PASSWORD, DB_USER_PASSWORD).withNetwork(network)
            .withNetworkAliases(DB_HOST);

    private static final McBackEndContainer be = new McBackEndContainer(DB_HOST,
            DB_USER_PASSWORD, ADMINISTRATOR_PASSWORD).withNetwork(network)
            .withNetworkAliases(BE_HOST);

    private static int nUsers;

    @Nonnull
    private static BasicUserDetails createBasicUserDetails() {
        return new BasicUserDetails("jeff-" + (++nUsers),
                "password", Authority.ALL, true, true, true, true);
    }

    @Test
    @Order(2)
    public void addUser() {
        final var userDetails = createBasicUserDetails();
        be.addUser(userDetails);

        final List<UserResponse> users;
        try {
            users = getUsers1();
        } catch (final IOException e) {
            throw new AssertionFailedError("Unable to get list of users", e);
        }
        assertThat("Added user", users.stream()
                .anyMatch(u -> userDetails.getUsername().equals(u.username())));
    }

    private void assertThatNoErrorMessagesLogged(final String logs) {
        assertThat(logs, not(containsString("ERROR")));
    }

    public static void close() {
        be.close();
        db.close();
        network.close();
    }

    @Test
    public void getGameIds_empty() {
        final var namedUUIDOptional = be.getScenarios().findAny();
        assertThat("namedUUID", namedUUIDOptional.isPresent());
        final var scenario = namedUUIDOptional.get().getId();
        final var user = be.getAdministrator();
        final var response = be.getGameCreationTimesResponse(scenario, user);
        response.expectStatus().isOk();
        response.expectBodyList(GameIdentifierResponse.class).hasSize(0);
    }

    @Test
    @Order(2)
    public void getUsers() {
        final List<UserResponse> users;
        try {
            users = getUsers1();
        } catch (final IOException e) {
            throw new AssertionFailedError("Unable to get list of users", e);
        }
        assertThat("List of users", users, not(empty()));
    }

    private List<UserResponse> getUsers1() throws IOException {
        final var usersAsJson = be.getJsonAsAdministrator("/api/user")
                .returnResult(String.class).getResponseBody()
                .blockFirst(Duration.ofSeconds(9));
        final var typeId = OBJECT_MAPPER.getTypeFactory()
                .constructCollectionType(List.class, UserResponse.class);
        return OBJECT_MAPPER.readValue(usersAsJson, typeId);
    }

    @BeforeAll
    public static void start() {
        /*
         * Start the containers bottom-up, and wait until each is ready, to reduce
         * the number of transient connection errors.
         */
        db.start();
        be.start();
    }

    @Test
    @Order(1)
    public void startUp() throws TimeoutException {
        try {
            be.awaitLogMessage(McBackEndContainer.STARTED_MESSAGE);
            be.awaitLogMessage(McBackEndContainer.CONNECTION_MESSAGE);
        } finally {// Provide useful diagnostics even if timeout
            final var logs = be.getLogs();
            assertAll("Log suitable messages",
                    () -> assertThat(logs,
                            containsString(McBackEndContainer.STARTED_MESSAGE)),
                    () -> assertThat(logs,
                            containsString(
                                    McBackEndContainer.CONNECTION_MESSAGE)),
                    () -> assertThatNoErrorMessagesLogged(logs),
                    () -> assertThat(logs,
                            not(containsString("Unable to start"))));
            be.assertHealthCheckOk();
        }
    }

    @AfterAll
    public static void stop() {
        /*
         * Stop the resources top-down, to reduce the number of transient
         * connection errors.
         */
        be.stop();
        db.stop();
        close();
    }
}
