package uk.badamson.mc;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.mockserver.client.MockServerClient;
import org.mockserver.matchers.Times;
import org.mockserver.model.*;
import org.testcontainers.containers.MockServerContainer;
import org.testcontainers.utility.DockerImageName;
import uk.badamson.mc.rest.*;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public final class MockMcBackEndContainer extends MockServerContainer {

    private static String encodeAsJson(final Object obj) {
        try {
            return MAPPER.writeValueAsString(obj);
        } catch (final JsonProcessingException e) {
            throw new IllegalArgumentException("can not encode Object as JSON", e);
        }

    }

    public MockMcBackEndContainer() {
        super(MOCKSERVER_IMAGE);
    }

    @Override
    public void start() {
        super.start();
        mockServerClient = new MockServerClient(getHost(), getServerPort());
    }

    @Override
    public void stop() {
        if (mockServerClient != null) {
            mockServerClient.stop();
            mockServerClient = null;
        }

        super.stop();
    }

    @Override
    public void close() {
        super.close();
    }

    public void reset() {
        if (mockServerClient != null) {
            mockServerClient.reset();
        }

    }

    public void mockCreateGameForScenario(@Nonnull UUID scenarioId, @Nonnull final UUID gameId) {
        mockServerClient.when(createGameForScenarioRequest(scenarioId)).respond(createGameForScenarioResponse(gameId));
    }

    private static HttpRequest createGameForScenarioRequest(@Nonnull UUID scenario) {
        return HttpRequest.request().withMethod("POST").withPath(Paths.createPathForGamesOfScenario(scenario));
    }

    private static HttpResponse createGameForScenarioResponse(@Nonnull final UUID gameId) {
        return foundResponse(Paths.createPathForGame(gameId));
    }

    private static HttpResponse foundResponse(@Nonnull String path) {
        return HttpResponse.response()
                .withStatusCode(HttpStatusCode.FOUND_302.code())
                .withHeader(Header.header("Location", path));
    }

    private static HttpResponse unauthorisedResponse() {
        return HttpResponse.response().withStatusCode(HttpStatusCode.UNAUTHORIZED_401.code());
    }

    public void mockGetGameIDs(@Nonnull UUID scenario, @Nonnull Set<NamedUUID> gameIds, Times times) {
        mockServerClient.when(getGameIDsRequest(scenario), times).respond(getGameIDsResponse(gameIds));
    }

    public void mockGetGameIDs(@Nonnull UUID scenario, @Nonnull Set<NamedUUID> gameIds) {
        mockGetGameIDs(scenario, gameIds, Times.unlimited());
    }

    private static HttpRequest getGameIDsRequest(@Nonnull UUID scenario) {
        return HttpRequest.request(Paths.createPathForGamesOfScenario(scenario)).withMethod("GET");
    }

    private static HttpResponse getGameIDsResponse(@Nonnull Set<NamedUUID> gameIds) {
        return jsonResponse(gameIds);
    }

    private static HttpResponse jsonResponse(@Nullable Object body) {
        return HttpResponse.response().withContentType(MediaType.APPLICATION_JSON).withBody(encodeAsJson(body));
    }

    public void mockGetGame(
            @Nonnull final UUID gameId, @Nonnull final UUID scenarioId, @Nonnull final Game game, Times times) {
        mockServerClient.when(getGameRequest(gameId), times).respond(getGameResponse(gameId, scenarioId, game));
    }

    public void mockGetGame(@Nonnull final UUID gameId, @Nonnull final UUID scenarioId, @Nonnull final Game game) {
        mockGetGame(gameId, scenarioId, game, Times.unlimited());
    }

    private static HttpRequest getGameRequest(@Nonnull final UUID game) {
        return HttpRequest.request(Paths.createPathForGame(game)).withMethod("GET");
    }

    private static HttpResponse getGameResponse(
            @Nonnull UUID gameId, @Nonnull UUID scenarioId, @Nonnull final Game game) {
        return jsonResponse(GameResponse.convertToResponse(gameId, scenarioId, game));
    }

    public void mockStartGame(@Nonnull final UUID game) {
        mockServerClient.when(startGameRequest(game)).respond(startGameResponse(game));
    }

    private static HttpRequest startGameRequest(@Nonnull final UUID game) {
        return HttpRequest.request(Paths.createPathForGame(game))
                .withQueryStringParameter("start", "")
                .withMethod("POST");
    }

    private static HttpResponse startGameResponse(@Nonnull final UUID game) {
        return foundResponse(Paths.createPathForGame(game));
    }

    public void mockStopGame(@Nonnull final UUID game) {
        mockServerClient.when(stopGameRequest(game)).respond(stopGameResponse(game));
    }

    private static HttpRequest stopGameRequest(@Nonnull final UUID game) {
        return HttpRequest.request(Paths.createPathForGame(game))
                .withQueryStringParameter("stop", "")
                .withMethod("POST");
    }

    private static HttpResponse stopGameResponse(@Nonnull final UUID game) {
        return foundResponse(Paths.createPathForGame(game));
    }

    public void mockEndRecruitment(@Nonnull final UUID game) {
        mockServerClient.when(endRecruitmentRequest(game)).respond(endRecruitmentResponse(game));
    }

    private static HttpRequest endRecruitmentRequest(@Nonnull final UUID game) {
        return HttpRequest.request(Paths.createPathForGame(game))
                .withQueryStringParameter("endRecruitment", "")
                .withMethod("POST");
    }

    private static HttpResponse endRecruitmentResponse(@Nonnull final UUID game) {
        return foundResponse(Paths.createPathForGame(game));
    }

    public void mockCurrentGame(@Nonnull final UUID game) {
        Objects.requireNonNull(game, "game");
        mockServerClient.when(currentGameRequest()).respond(currentGameResponse(game));
    }

    public void mockNoCurrentGame() {
        mockServerClient.when(currentGameRequest()).respond(HttpResponse.notFoundResponse());
    }

    private static HttpRequest currentGameRequest() {
        return HttpRequest.request(Paths.CURRENT_GAME_PATH).withMethod("GET");
    }

    private static HttpResponse currentGameResponse(@Nonnull final UUID game) {
        return foundResponse(Paths.createPathForGame(game));
    }

    public void mockJoinGame(@Nonnull final UUID game) {
        mockServerClient.when(joinGameRequest(game)).respond(joinGameResponse(game));
    }

    private static HttpRequest joinGameRequest(@Nonnull final UUID game) {
        return HttpRequest.request(Paths.createPathForGame(game))
                .withQueryStringParameter("join", "")
                .withMethod("POST");
    }

    private static HttpResponse joinGameResponse(@Nonnull final UUID game) {
        return foundResponse(Paths.createPathForGame(game));
    }

    public void mockMayJoinGame(@Nonnull final UUID game, final boolean mayJoin) {
        mockServerClient.when(mayJoinGameRequest(game)).respond(mayJoinGameResponse(mayJoin));
    }

    private static HttpRequest mayJoinGameRequest(@Nonnull final UUID game) {
        return HttpRequest.request(Paths.createPathForGame(game))
                .withQueryStringParameter("mayJoin", "")
                .withMethod("GET");
    }

    private static HttpResponse mayJoinGameResponse(final boolean mayJoin) {
        return jsonResponse(mayJoin);
    }

    public void mockGetAllScenarios(@Nonnull final Set<NamedUUID> scenarios) {
        mockServerClient.when(getAllScenariosRequest()).respond(getAllScenariosResponse(scenarios));
    }

    private static HttpRequest getAllScenariosRequest() {
        return HttpRequest.request(Paths.SCENARIOS_PATH).withMethod("GET");
    }

    private static HttpResponse getAllScenariosResponse(@Nonnull final Set<NamedUUID> scenarios) {
        final var dto = scenarios.stream().map(ni -> new uk.badamson.mc.rest.NamedUUID(ni.getId(), ni.getTitle())).collect(Collectors.toUnmodifiableSet());
        return jsonResponse(dto);
    }

    public void mockGetScenario(@Nonnull UUID id, @Nonnull final Scenario scenario) {
        mockServerClient.when(getScenarioRequest(id)).respond(getScenarioResponse(id, scenario));
    }

    private static HttpRequest getScenarioRequest(@Nonnull UUID scenario) {
        return HttpRequest.request(Paths.createPathForScenario(scenario)).withMethod("GET");
    }

    private static HttpResponse getScenarioResponse(@Nonnull UUID id, @Nonnull final Scenario scenario) {
        Objects.requireNonNull(scenario, "scenario");
        return jsonResponse(ScenarioResponse.convertToResponse(id, scenario));
    }

    public void mockAddUser(@Nonnull final BasicUserDetails userDetails, @Nonnull final UUID id) {
        mockServerClient.when(addUserRequest(userDetails)).respond(addUserResponse(id));
    }

    private static HttpRequest addUserRequest(@Nonnull final BasicUserDetails userDetails) {
        return HttpRequest.request(Paths.USERS_PATH).withMethod("POST")
                .withBody(encodeAsJson(new MinimalUserDetails(userDetails)));
    }

    private static HttpResponse addUserResponse(@Nonnull final UUID id) {
        return foundResponse(Paths.createPathForUser(id));
    }

    public void mockGetAllUsers(@Nonnull final Set<User> users, @Nonnull Times times) {
        mockServerClient.when(getAllUsersRequest(), times).respond(getAllUsersResponse(users));
    }

    public void mockGetAllUsers(@Nonnull final Set<User> users) {
        mockGetAllUsers(users, Times.unlimited());
    }

    private static HttpRequest getAllUsersRequest() {
        return HttpRequest.request(Paths.USERS_PATH).withMethod("GET");
    }

    private static HttpResponse  getAllUsersResponse(@Nonnull final Set<User> users) {
        final var dto = users.stream()
                .map(UserResponse::convertToResponse)
                .collect(Collectors.toUnmodifiableSet());
        return jsonResponse(dto);
    }

    public void mockGetSelf(@Nonnull final User user, Times times) {
        mockServerClient.when(getSelfRequest(), times).respond(getSelfResponse(user));
    }

    public void mockGetSelf(@Nonnull final User user) {
        mockGetSelf(user, Times.unlimited());
    }

    public void mockGetSelfUnauthenticated(Times times) {
        mockServerClient.when(getSelfRequest(), times).respond(unauthorisedResponse());
    }

    public void mockGetSelfUnauthenticated() {
        mockGetSelfUnauthenticated(Times.unlimited());
    }

    private static HttpRequest getSelfRequest() {
        return HttpRequest.request(Paths.SELF_PATH).withMethod("GET");
    }

    private static HttpResponse getSelfResponse(@Nonnull final User user) {
        return jsonResponse(UserResponse.convertToResponse(user));
    }

    public void mockGetUser(@Nonnull final User user) {
        mockServerClient.when(getUserRequest(user.getId())).respond(getUserResponse(user));
    }

    private static HttpRequest getUserRequest(@Nonnull final UUID id) {
        return HttpRequest.request(Paths.createPathForUser(id)).withMethod("GET");
    }

    private static HttpResponse getUserResponse(@Nonnull final User user) {
        Objects.requireNonNull(user, "user");
        return jsonResponse(UserResponse.convertToResponse(user));
    }

    public void mockLogin(@Nonnull User user, @Nonnull final String sessionCookie, @Nonnull String xsrfToken) {
        mockServerClient.when(loginRequest()).respond(loginResponse(user, sessionCookie, xsrfToken));
    }

    private static HttpRequest loginRequest() {
        return HttpRequest.request(Paths.SELF_PATH)
                .withMethod("GET")
                .withHeader(Header.header("Authorization", "Basic .*"));
    }

    private static HttpResponse loginResponse(
            @Nonnull User user,
            @Nonnull final String sessionCookie,
            @Nonnull String xsrfToken
    ) {
        return HttpResponse.response()
                .withCookie("JSESSIONID", sessionCookie)
                .withCookie("XSRF-TOKEN", xsrfToken)
                .withContentType(MediaType.APPLICATION_JSON)
                .withBody(encodeAsJson(UserResponse.convertToResponse(user)));
    }

    private static final DockerImageName MOCKSERVER_IMAGE = DockerImageName.parse("mockserver/mockserver:5.13.2");
    private static final ObjectMapper MAPPER;

    static {
        MAPPER = new ObjectMapper();
        MAPPER.registerModule(new JavaTimeModule());
    }

    private MockServerClient mockServerClient;

    final private static class MinimalUserDetails {
        public MinimalUserDetails(@Nonnull final BasicUserDetails userDetails) {
            this.username = userDetails.getUsername();
            this.password = userDetails.getPassword();
        }

        public final String username;
        public final String password;
        public final Set<Authority> authorities = Set.of();
    }
}
