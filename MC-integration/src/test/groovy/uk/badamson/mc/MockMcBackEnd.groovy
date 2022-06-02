package uk.badamson.mc

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import org.mockserver.client.MockServerClient
import org.mockserver.matchers.Times
import org.mockserver.model.HttpRequest
import org.mockserver.model.HttpResponse
import org.mockserver.model.HttpStatusCode
import org.mockserver.model.MediaType
import org.testcontainers.containers.MockServerContainer
import org.testcontainers.shaded.com.fasterxml.jackson.core.JsonProcessingException
import org.testcontainers.utility.DockerImageName

import javax.annotation.Nonnull
import javax.annotation.Nullable
import java.time.Instant
import java.time.format.DateTimeFormatter
import java.util.stream.Collectors

import static org.mockserver.model.Header.header
import static org.mockserver.model.HttpResponse.notFoundResponse
import static org.mockserver.model.HttpResponse.response

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

final class MockMcBackEnd extends MockServerContainer {
    private static final DockerImageName MOCKSERVER_IMAGE =
            DockerImageName.parse('mockserver/mockserver:5.13.2')

    private static final DateTimeFormatter URI_DATETIME_FORMATTER = DateTimeFormatter.ISO_INSTANT

    private static final ObjectMapper MAPPER
    static {
        MAPPER = new ObjectMapper()
        MAPPER.registerModule(new JavaTimeModule())
    }

    private static String gamePath(final Game.Identifier game) {
        Objects.requireNonNull(game, 'game')
        return gamesListPath(game.getScenario()) + URI_DATETIME_FORMATTER.format(game.getCreated())
    }

    private static String gamePlayersPath(final Game.Identifier game) {
        return gamePath(game) + '/players'
    }

    private static String gamesListPath(final UUID scenario) {
        scenarioPath(scenario) + '/game/'
    }

    private static String scenarioPath(final UUID scenario) {
        Objects.requireNonNull(scenario, 'scenario')
        "/api/scenario/${scenario}"
    }

    private static String userPath(@Nonnull final UUID id) {
        Objects.requireNonNull(id, 'id')
        "/api/user/$id"
    }

    private static String encodeAsJson(final Object obj) {
        try {
            return MAPPER.writeValueAsString(obj)
        } catch (final JsonProcessingException e) {
            throw new IllegalArgumentException('can not encode Object as JSON', e)
        }
    }

    private MockServerClient mockServerClient

    @SuppressWarnings('deprecation')
    MockMcBackEnd() {
        super(MOCKSERVER_IMAGE)
    }

    @Override
    void start() {
        super.start()
        mockServerClient = new MockServerClient(getHost(), getServerPort())
    }

    @Override
    void stop() {
        if (mockServerClient != null) {
            mockServerClient.stop()
            mockServerClient = null
        }
        super.stop()
    }

    @Override
    void close() {
        super.close()
    }

    void reset() {
        if (mockServerClient != null) {
            mockServerClient.reset()
        }
    }

    void mockCreateGameForScenario(@Nonnull final Game.Identifier gameId) {
        mockServerClient.when(createGameForScenarioRequest(gameId.scenario))
                .respond(createGameForScenarioResponse(gameId))
    }

    void mockCreateGameForNoSuchScenario(@Nonnull final UUID scenario) {
        mockServerClient.when(createGameForScenarioRequest(scenario))
                .respond(notFoundResponse())
    }

    void mockUnauthorisedToCreateGameForScenario(@Nonnull final UUID scenario) {
        mockServerClient.when(createGameForScenarioRequest(scenario))
                .respond(unauthorisedResponse())
    }

    private static HttpRequest createGameForScenarioRequest(@Nonnull UUID scenario) {
        HttpRequest.request()
                .withMethod('POST')
                .withPath(gamesListPath(scenario))
    }

    private static HttpResponse createGameForScenarioResponse(@Nonnull final Game.Identifier gameId) {
        foundResponse(gamePath(gameId))
    }

    private static HttpResponse foundResponse(@Nonnull String path) {
        response()
                .withStatusCode(HttpStatusCode.FOUND_302.code())
                .withHeader(header('Location', path))
    }

    private static HttpResponse unauthorisedResponse() {
        response()
                .withStatusCode(HttpStatusCode.UNAUTHORIZED_401.code())
    }

    void mockGetGameCreationTimes(@Nonnull UUID scenario, @Nonnull Set<Instant> gameCreationTimes, Times times = Times.unlimited()) {
        mockServerClient.when(getGameCreationTimesRequest(scenario), times)
                .respond(getGameCreationTimesResponse(gameCreationTimes))
    }

    void mockGetGameCreationTimesForNoSuchGame(@Nonnull UUID scenario) {
        mockServerClient.when(getGameCreationTimesRequest(scenario))
                .respond(notFoundResponse())
    }

    void mockUnauthorisedGetGameCreationTimes(@Nonnull UUID scenario) {
        mockServerClient.when(getGameCreationTimesRequest(scenario))
                .respond(unauthorisedResponse())
    }

    private static HttpRequest getGameCreationTimesRequest(@Nonnull UUID scenario) {
        HttpRequest.request(gamesListPath(scenario))
                .withMethod('GET')
    }

    private static HttpResponse getGameCreationTimesResponse(@Nonnull Set<Instant> times) {
        def formattedTimes = times.stream()
                .map(time -> URI_DATETIME_FORMATTER.format(time))
                .collect(Collectors.toUnmodifiableList())
        jsonResponse(formattedTimes)
    }

    private static HttpResponse jsonResponse(@Nullable body) {
        response().withContentType(MediaType.APPLICATION_JSON)
                .withBody(encodeAsJson(body))
    }

    void mockGetGame(@Nonnull final Game game, Times times = Times.unlimited()) {
        mockServerClient.when(getGameRequest(game.identifier), times)
                .respond(getGameResponse(game))
    }

    void mockGetNoSuchGame(@Nonnull final Game game) {
        mockServerClient.when(getGameRequest(game.identifier))
                .respond(notFoundResponse())
    }

    void mockUnauthorisedGetGame(@Nonnull final Game game) {
        mockServerClient.when(getGameRequest(game.identifier))
                .respond(unauthorisedResponse())
    }

    private static HttpRequest getGameRequest(@Nonnull final Game.Identifier game) {
        HttpRequest.request(gamePath(game))
                .withMethod('GET')
    }

    private static HttpResponse getGameResponse(@Nonnull final Game game) {
        jsonResponse(game)
    }

    void mockStartGame(@Nonnull final Game.Identifier game) {
        mockServerClient.when(startGameRequest(game))
                .respond(startGameResponse(game))
    }

    void mockStartNoSuchGame(@Nonnull final Game.Identifier game) {
        mockServerClient.when(startGameRequest(game))
                .respond(notFoundResponse())
    }

    void mockUnauthorisedToStartGame(@Nonnull final Game.Identifier game) {
        mockServerClient.when(startGameRequest(game))
                .respond(unauthorisedResponse())
    }

    private static HttpRequest startGameRequest(@Nonnull final Game.Identifier game) {
        HttpRequest.request(gamePath(game))
                .withQueryStringParameter('start', '')
                .withMethod('POST')
    }

    private static HttpResponse startGameResponse(@Nonnull final Game.Identifier game) {
        foundResponse(gamePath(game))
    }

    void mockStopGame(@Nonnull final Game.Identifier game) {
        mockServerClient.when(stopGameRequest(game))
                .respond(stopGameResponse(game))
    }

    void mockStopNoSuchGame(@Nonnull final Game.Identifier game) {
        mockServerClient.when(stopGameRequest(game))
                .respond(notFoundResponse())
    }

    void mockUnauthorisedToStopGame(@Nonnull final Game.Identifier game) {
        mockServerClient.when(stopGameRequest(game))
                .respond(unauthorisedResponse())
    }

    private static HttpRequest stopGameRequest(@Nonnull final Game.Identifier game) {
        HttpRequest.request(gamePath(game))
                .withQueryStringParameter('stop', '')
                .withMethod('POST')
    }

    private static HttpResponse stopGameResponse(@Nonnull final Game.Identifier game) {
        foundResponse(gamePath(game))
    }

    void mockEndRecruitment(@Nonnull final Game.Identifier game) {
        mockServerClient.when(endRecruitmentRequest(game))
                .respond(endRecruitmentResponse(game))
    }

    void mockEndRecruitmentForNoSuchGame(@Nonnull final Game.Identifier game) {
        mockServerClient.when(endRecruitmentRequest(game))
                .respond(notFoundResponse())
    }

    void mockUnauthorisedToEndRecruitment(@Nonnull final Game.Identifier game) {
        mockServerClient.when(endRecruitmentRequest(game))
                .respond(unauthorisedResponse())
    }

    private static HttpRequest endRecruitmentRequest(@Nonnull final Game.Identifier game) {
        HttpRequest.request(gamePlayersPath(game))
                .withQueryStringParameter('endRecruitment', '')
                .withMethod('POST')
    }

    private static HttpResponse endRecruitmentResponse(@Nonnull final Game.Identifier game) {
        foundResponse(gamePlayersPath(game))
    }

    void mockCurrentGame(@Nonnull final Game.Identifier game) {
        Objects.requireNonNull(game, 'game')
        mockServerClient.when(currentGameRequest())
                .respond(currentGameResponse(game))
    }

    void mockNoCurrentGame() {
        mockServerClient.when(currentGameRequest())
                .respond(notFoundResponse())
    }

    private static HttpRequest currentGameRequest() {
        HttpRequest.request('/api/self/current-game')
                .withMethod('GET')
    }

    private static HttpResponse currentGameResponse(@Nonnull final Game.Identifier game) {
        foundResponse(gamePath(game))
    }

    void mockGetGamePlayers(@Nonnull GamePlayers players, Times times = Times.unlimited()) {
        mockServerClient.when(getGamePlayersRequest(players.game), times)
                .respond(getGamePlayersResponse(players))
    }

    void mockGetNoSuchGamePlayers(@Nonnull final Game.Identifier game) {
        mockServerClient.when(getGamePlayersRequest(game))
                .respond(notFoundResponse())
    }

    void mockUnauthorisedToGetGamePlayers(@Nonnull Game.Identifier game) {
        mockServerClient.when(getGamePlayersRequest(game))
                .respond(unauthorisedResponse())
    }

    private static HttpRequest getGamePlayersRequest(@Nonnull final Game.Identifier game) {
        HttpRequest.request(gamePlayersPath(game))
                .withMethod('GET')
                .withQueryStringParameter('!mayJoin')
    }

    private static HttpResponse getGamePlayersResponse(@Nonnull GamePlayers players) {
        jsonResponse(players)
    }

    void mockJoinGame(@Nonnull final Game.Identifier game) {
        mockServerClient.when(joinGameRequest(game))
                .respond(joinGameResponse(game))
    }

    void mockJoinNoSuchGame(@Nonnull final Game.Identifier game) {
        mockServerClient.when(joinGameRequest(game))
                .respond(notFoundResponse())
    }

    void mockUnauthorisedToJoinGame(@Nonnull final Game.Identifier game) {
        mockServerClient.when(joinGameRequest(game))
                .respond(unauthorisedResponse())
    }

    private static HttpRequest joinGameRequest(@Nonnull final Game.Identifier game) {
        HttpRequest.request(gamePlayersPath(game))
                .withQueryStringParameter('join', '')
                .withMethod('POST')
    }

    private static HttpResponse joinGameResponse(@Nonnull final Game.Identifier game) {
        foundResponse(gamePlayersPath(game))
    }

    void mockMayJoinGame(@Nonnull final Game.Identifier game, final boolean mayJoin) {
        mockServerClient.when(mayJoinGameRequest(game))
                .respond(mayJoinGameResponse(mayJoin))
    }

    void mockMayJoinNoSuchGame(@Nonnull final Game.Identifier game) {
        mockServerClient.when(mayJoinGameRequest(game))
                .respond(notFoundResponse())
    }

    private static HttpRequest mayJoinGameRequest(@Nonnull final Game.Identifier game) {
        HttpRequest.request(gamePlayersPath(game))
                .withQueryStringParameter('mayJoin', '')
                .withMethod('GET')
    }

    private static HttpResponse mayJoinGameResponse(final boolean mayJoin) {
        jsonResponse(Boolean.valueOf(mayJoin))
    }

    void mockGetAllScenarios(@Nonnull final Set<NamedUUID> scenarios) {
        mockServerClient.when(getAllScenariosRequest())
                .respond(getAllScenariosResponse(scenarios))
    }

    private static HttpRequest getAllScenariosRequest() {
        HttpRequest.request('/api/scenario')
                .withMethod('GET')
    }

    private static HttpResponse getAllScenariosResponse(@Nonnull final Set<NamedUUID> scenarios) {
        jsonResponse(scenarios)
    }

    void mockGetScenario(@Nonnull final Scenario scenario) {
        mockServerClient.when(getScenarioRequest(scenario.identifier))
                .respond(getScenarioResponse(scenario))
    }

    void mockGetNoSuchScenario(@Nonnull final UUID scenario) {
        mockServerClient.when(getScenarioRequest(scenario))
                .respond(notFoundResponse())
    }

    private static HttpRequest getScenarioRequest(@Nonnull UUID scenario) {
        HttpRequest.request(scenarioPath(scenario))
                .withMethod('GET')
    }

    private static HttpResponse getScenarioResponse(@Nonnull final Scenario scenario) {
        Objects.requireNonNull(scenario, 'scenario')
        jsonResponse(scenario)
    }

    void mockAddUser(@Nonnull final BasicUserDetails userDetails, @Nonnull final UUID id) {
        mockServerClient.when(addUserRequest(userDetails))
                .respond(addUserResponse(id))
    }

    void mockAddExistingUser(@Nonnull final BasicUserDetails userDetails) {
        mockServerClient.when(addUserRequest(userDetails))
                .respond(response().withStatusCode(HttpStatusCode.CONFLICT_409.code()))
    }

    void mockAddBadUser(@Nonnull final BasicUserDetails userDetails) {
        mockServerClient.when(addUserResponse(userDetails))
                .respond(response().withStatusCode(HttpStatusCode.BAD_REQUEST_400.code()))
    }

    private static HttpRequest addUserRequest(@Nonnull final BasicUserDetails userDetails) {
        HttpRequest.request('/api/user')
                .withMethod('POST')
                .withContentType(MediaType.APPLICATION_JSON)
                .withBody(encodeAsJson(userDetails))
    }

    private static HttpRequest addUserResponse(@Nonnull final BasicUserDetails userDetails) {
        HttpRequest.request('/api/user')
                .withMethod('POST')
                .withContentType(MediaType.APPLICATION_JSON)
                .withBody(encodeAsJson(userDetails))
    }

    private static HttpResponse addUserResponse(@Nonnull final UUID id) {
        response()
                .withStatusCode(HttpStatusCode.CREATED_201.code())
                .withHeader(header('Location', userPath(id)))
    }

    void mockGetAllUsers(@Nonnull final Set<User> users) {
        mockServerClient.when(getAllUsersRequest())
                .respond(getAllUsersResponse(users))
    }

    private static HttpRequest getAllUsersRequest() {
        HttpRequest.request('/api/user')
                .withMethod('GET')
    }

    private static HttpResponse getAllUsersResponse(@Nonnull final Set<User> users) {
        jsonResponse(users)
    }

    void mockGetSelf(@Nonnull final User user, Times times = Times.unlimited()) {
        mockServerClient.when(getSelfRequest(), times)
                .respond(getSelfResponse(user))
    }

    void mockGetSelfUnauthenticated(Times times = Times.unlimited()) {
        mockServerClient.when(getSelfRequest(), times)
                .respond(unauthorisedResponse())
    }

    private static HttpRequest getSelfRequest() {
        HttpRequest.request('/api/self')
                .withMethod('GET')
    }

    private static HttpResponse getSelfResponse(@Nonnull final User user) {
        jsonResponse(user)
    }

    void mockGetUser(@Nonnull final User user) {
        mockServerClient.when(getUserRequest(user.id))
                .respond(getUserResponse(user))
    }

    void mockGeUnknownUser(@Nonnull final UUID id) {
        mockServerClient.when(getUserRequest(id))
                .respond(notFoundResponse())
    }

    private static HttpRequest getUserRequest(@Nonnull final UUID id) {
        HttpRequest.request(userPath(id))
                .withMethod('GET')
    }

    private static HttpResponse getUserResponse(@Nonnull final User user) {
        Objects.requireNonNull(user, 'user')
        jsonResponse(user)
    }

    void mockLogin(@Nonnull final String sessionCookie, @Nonnull String xsrfToken) {
        mockServerClient.when(loginRequest())
                .respond(loginResponse(sessionCookie, xsrfToken))
    }

    private static HttpRequest loginRequest() {
        HttpRequest.request('/api/self')
                .withMethod('GET')
                .withHeader(header('Authorization', 'Basic .*'))
    }

    private static HttpResponse loginResponse(@Nonnull final String sessionCookie, @Nonnull String xsrfToken) {
        response()
                .withCookie('JSESSIONID', sessionCookie)
                .withCookie('XSRF-TOKEN', xsrfToken)
    }
}
