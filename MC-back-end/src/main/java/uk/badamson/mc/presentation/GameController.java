package uk.badamson.mc.presentation;
/*
 * © Copyright Benedict Adamson 2019-22.
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

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uk.badamson.mc.Authority;
import uk.badamson.mc.Game;
import uk.badamson.mc.Game.Identifier;
import uk.badamson.mc.Scenario;
import uk.badamson.mc.rest.GamePlayersResponse;
import uk.badamson.mc.rest.GameResponse;
import uk.badamson.mc.service.GameSpringService;
import uk.badamson.mc.service.IllegalGameStateException;
import uk.badamson.mc.service.UserAlreadyPlayingException;
import uk.badamson.mc.spring.SpringAuthority;
import uk.badamson.mc.spring.SpringUser;

import javax.annotation.Nonnull;
import javax.annotation.security.RolesAllowed;
import java.net.URI;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

/**
 * <p>
 * End-points for the game HTTP resources.
 * </p>
 */
@RestController
public class GameController {


    public static final String CURRENT_GAME_PATH = "/api/self/current-game";

    /**
     * <p>
     * The format of URI paths for {@linkplain #createPathFor(Identifier) game
     * resources}.
     * </p>
     */
    public static final String GAME_PATH_PATTERN = "/api/scenario/{scenario}/game/{created:.+}";

    /**
     * <p>
     * The format of URI paths for {@linkplain #createPathForGames(UUID) games
     * collection resources}.
     * </p>
     */
    public static final String GAMES_PATH_PATTERN = "/api/scenario/{scenario}/game";

    /**
     * <p>
     * The format of URI paths for
     * {@linkplain #createPathForGamePlayersOf(Identifier) game player
     * resources}.
     * </p>
     */
    public static final String GAME_PLAYERS_PATH_PATTERN = "/api/scenario/{scenario}/game/{created}/players";

    /**
     * <p>
     * The format of time-stamps when used as parts of paths of URIs used by this
     * controller.
     * </p>
     */
    public static final DateTimeFormatter URI_DATETIME_FORMATTER = DateTimeFormatter.ISO_INSTANT;

    public static final String START_PARAM = "start";

    public static final String STOP_PARAM = "stop";

    public static final String END_RECRUITMENT_PARAM = "endRecruitment";

    public static final String MAY_JOIN_PARAM = "mayJoin";

    public static final String JOIN_PARAM = "join";

    @Nonnull
    private final GameSpringService gameService;

    GameController(@Nonnull final GameSpringService gameService) {
        this.gameService = Objects.requireNonNull(gameService, "gameService");
    }

    /**
     * <p>
     * Create a valid path for a game resource for a game that has a given
     * identifier.
     * </p>
     *
     * @param id The identifier of the game
     * @throws NullPointerException If {@code id} is null.
     * @see #getGame(SpringUser, UUID, Instant)
     */
    @Nonnull
    public static String createPathFor(@Nonnull final Game.Identifier id) {
        Objects.requireNonNull(id, "id");
        return createPathForGames(id.getScenario())
                + URI_DATETIME_FORMATTER.format(id.getCreated());
    }

    /**
     * <p>
     * Create a valid path for the games collection resource for a scenario with
     * a given identifier.
     * </p>
     * <p>
     * The created value is consistent with the path used for
     * {@link #createGameForScenario(UUID)} and {@link #getCreationTimes(UUID)}.
     * </p>
     *
     * @param scenario The identifier of the scenario
     * @return The path.
     * @throws NullPointerException If {@code scenario} is null.
     */
    @Nonnull
    public static String createPathForGames(@Nonnull final UUID scenario) {
        return ScenarioController.createPathFor(scenario) + "/game/";
    }

    @Nonnull
    public static String createPathForStarting(@Nonnull final Game.Identifier id) {
        return createPathFor(id) + "?" + START_PARAM;
    }

    @Nonnull
    public static String createPathForStopping(@Nonnull final Game.Identifier id) {
        return createPathFor(id) + "?" + STOP_PARAM;
    }

    public static String createPathForEndRecruitmentOf(
            final Game.Identifier id) {
        return createPathForGamePlayersOf(id) + "?" + END_RECRUITMENT_PARAM;
    }

    public static String createPathForGamePlayersOf(final Game.Identifier id) {
        return createPathFor(id) + "/players";
    }

    public static String createPathForJoining(final Game.Identifier id) {
        return createPathForGamePlayersOf(id) + "?" + JOIN_PARAM;
    }

    public static String createPathForMayJoinQueryOf(final Game.Identifier id) {
        return createPathForGamePlayersOf(id) + "?" + MAY_JOIN_PARAM;
    }

    /**
     * <p>
     * Create a game for a given scenario.
     * </p>
     * <ul>
     * <li>Creates a new game for the given scenario.</li>
     * <li>Returns a redirect to the newly created game. That is, a response with
     * <ul>
     * <li>A {@linkplain ResponseEntity#getStatusCode() status code} of
     * {@linkplain HttpStatus#FOUND 302 (Found)}</li>
     * <li>A {@linkplain HttpHeaders#getLocation()
     * Location}{@linkplain ResponseEntity#getHeaders() header} giving the
     * {@linkplain #createPathFor(Identifier) path} of the new game.</li>
     * </ul>
     * </li>
     * <li>The scenario ID part of the identifier of the newly created game is
     * equal to the given scenario identifier.</li>
     * </ul>
     *
     * @param scenario The unique ID of the scenario for which to create a game.
     * @return The response.
     * @throws NullPointerException    If {@code scenario} is null.
     * @throws ResponseStatusException <ul>
     *                                                                                                            <li>With a {@linkplain ResponseStatusException#getStatus()
     *                                                                                                            status} of {@linkplain HttpStatus#NOT_FOUND 404 (Not Found)} if
     *                                                                                                            there is no scenario with the given {@code scenario} ID
     *                                                                                                            {@linkplain UUID#equals(Object) equivalent to} its
     *                                                                                                            {@linkplain Scenario#getIdentifier() identifier}.</li>
     *                                                                                                            <li>With a {@linkplain ResponseStatusException#getStatus()
     *                                                                                                            status} of {@linkplain HttpStatus#INTERNAL_SERVER_ERROR 500
     *                                                                                                            (Internal Server Error)} if there is data access error.</li>
     *                                                                                                            </ul>
     */
    @PostMapping(GAMES_PATH_PATTERN)
    @Nonnull
    @RolesAllowed("MANAGE_GAMES")
    public ResponseEntity<Void> createGameForScenario(
            @Nonnull @PathVariable("scenario") final UUID scenario) {
        try {
            final var game = gameService.create(scenario);

            final var location = URI.create(createPathFor(game.getIdentifier()));
            final var headers = new HttpHeaders();
            headers.setLocation(location);
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        } catch (final NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "unrecognized ID", e);
        } catch (final DataAccessException e) {
            // Hard to test
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    e.getMessage(), e);
        }
    }

    /**
     * <p>
     * Get the creation times of the games for a given scenario, formatted in a
     * manner suitable for use in URIs used by this controller.
     * </p>
     *
     * @param scenario The unique ID of the scenario for which to create a game.
     * @throws NullPointerException    If {@code scenario} is null.
     * @throws ResponseStatusException With a {@linkplain ResponseStatusException#getStatus() status}
     *                                 of {@linkplain HttpStatus#NOT_FOUND 404 (Not Found)} if there
     *                                 is no scenario with the given {@code scenario} ID
     *                                 {@linkplain UUID#equals(Object) equivalent to} its
     *                                 {@linkplain Scenario#getIdentifier() identifier}.
     */
    @GetMapping(GAMES_PATH_PATTERN)
    @Nonnull
    public Stream<String> getCreationTimes(
            @Nonnull @PathVariable("scenario") final UUID scenario) {
        try {
            return gameService.getCreationTimesOfGamesOfScenario(scenario)
                    .map(URI_DATETIME_FORMATTER::format);
        } catch (final NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "unrecognized ID", e);
        }
    }

    /**
     * @param scenario The unique ID of the scenario of the wanted game.
     * @param created  The creation time of the wanted game.
     * @throws NullPointerException    <ul>
     *                                 <li>If {@code scenario} is null.</li>
     *                                 <li>If {@code created} is null.</li>
     *                                 </ul>
     * @throws ResponseStatusException With a {@linkplain ResponseStatusException#getStatus() status}
     *                                 of {@linkplain HttpStatus#NOT_FOUND 404 (Not Found)} if there
     *                                 is no game that has {@linkplain Game#getIdentifier()
     *                                 identification information} equivalent to the given
     *                                 {@code scenario} and {@code created}.
     */
    @GetMapping(GAME_PATH_PATTERN)
    @RolesAllowed({"MANAGE_GAMES", "PLAYER"})
    @Nonnull
    public GameResponse getGame(
            @Nonnull @AuthenticationPrincipal final SpringUser user,
            @Nonnull @PathVariable("scenario") final UUID scenario,
            @Nonnull @PathVariable("created") final Instant created) {
        final var id = new Game.Identifier(scenario, created);

        final Optional<Game> game;
        if (user.getAuthorities().contains(SpringAuthority.ROLE_MANAGE_GAMES)) {
            game = gameService.getGameAsGameManager(id);
        } else if (user.getAuthorities().contains(SpringAuthority.ROLE_PLAYER)) {
            game = gameService.getGameAsNonGameManager(id,
                    user.getId());
        } else {
            throw new IllegalArgumentException("Request not permitted for role");
        }

        if (game.isPresent()) {
            return game.map(g -> GameResponse.convertToResponse(id, g)).get();
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "unrecognized IDs");
        }
    }

    @PostMapping(path = GAME_PATH_PATTERN, params = {START_PARAM})
    @RolesAllowed("MANAGE_GAMES")
    @Nonnull
    public ResponseEntity<Void> startGame(
            @Nonnull @AuthenticationPrincipal final SpringUser user,
            @Nonnull @PathVariable("scenario") final UUID scenario,
            @Nonnull @PathVariable("created") final Instant created) {
        Objects.requireNonNull(user, "user");
        final var gameId = new Game.Identifier(scenario, created);
        try {
            gameService.startGame(gameId);
            final var location = URI.create(createPathFor(gameId));
            final var headers = new HttpHeaders();
            headers.setLocation(location);
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        } catch (final NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "unrecognized game ID", e);
        } catch (final IllegalGameStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(),
                    e);
        }
    }

    @PostMapping(path = GAME_PATH_PATTERN, params = {STOP_PARAM})
    @RolesAllowed("MANAGE_GAMES")
    @Nonnull
    public ResponseEntity<Void> stopGame(
            @Nonnull @AuthenticationPrincipal final SpringUser user,
            @Nonnull @PathVariable("scenario") final UUID scenario,
            @Nonnull @PathVariable("created") final Instant created) {
        Objects.requireNonNull(user, "user");
        final var gameId = new Game.Identifier(scenario, created);
        try {
            gameService.stopGame(gameId);
            final var location = URI.create(createPathFor(gameId));
            final var headers = new HttpHeaders();
            headers.setLocation(location);
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        } catch (final NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "unrecognized game ID", e);
        } catch (final IllegalGameStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(),
                    e);
        }
    }
    /**
     * <p>
     * Behaviour of the GET verb for a game players resource.
     * </p>
     * <ul>
     * <li>Returns a (non null) game players container.</li>
     * <li>The {@linkplain Identifier#getScenario() scenario identifier} of the
     * {@linkplain Game#getIdentifier()}  game identifier} of the game players
     * container {@linkplain UUID#equals(Object) is equivalent to} the given
     * scenario ID</li>
     * <li>The {@linkplain Identifier#getCreated() creation time} of the
     * {@linkplain Game#getIdentifier()}  game identifier} of the game players
     * container {@linkplain Instant#equals(Object) is equivalent to} the given
     * creation time</li>
     * </ul>
     * <ul>
     * <li>{@linkplain GameSpringService#endRecruitment(Identifier) ends
     * recruitment} for the game with the given ID.</li>
     * <li>Returns a redirect to the modified game players resource. That is, a
     * response with
     * <ul>
     * <li>A {@linkplain ResponseEntity#getStatusCode() status code} of
     * {@linkplain HttpStatus#FOUND 302 (Found)}</li>
     * <li>A {@linkplain HttpHeaders#getLocation()
     * Location}{@linkplain ResponseEntity#getHeaders() header} giving the
     * {@linkplain #createPathForGamePlayersOf(Identifier) path} of the
     * resource.</li>
     * </ul>
     * </li>
     * </ul>
     *
     * @param scenario The unique ID of the scenario of the game.
     * @param created  The creation time of the game.
     * @return The response.
     * @throws NullPointerException    <ul>
     *                                                                                                            <li>If {@code scenario} is null.</li>
     *                                                                                                            <li>If {@code created} is null.</li>
     *                                                                                                            </ul>
     * @throws ResponseStatusException With a {@linkplain ResponseStatusException#getStatus() status}
     *                                 of {@linkplain HttpStatus#NOT_FOUND 404 (Not Found)} if there
     *                                 is no game that has {@linkplain Game#getIdentifier()
     *                                 identification information} equivalent to the given
     *                                 {@code scenario} and {@code created}.
     */
    @PostMapping(path = GAME_PLAYERS_PATH_PATTERN,
            params = {END_RECRUITMENT_PARAM})
    @RolesAllowed("MANAGE_GAMES")
    @Nonnull
    public ResponseEntity<Void> endRecruitment(
            @Nonnull @PathVariable("scenario") final UUID scenario,
            @Nonnull @PathVariable("created") final Instant created) {
        final var id = new Game.Identifier(scenario, created);
        try {
            gameService.endRecruitment(id);
            final var location = URI.create(createPathForGamePlayersOf(id));
            final var headers = new HttpHeaders();
            headers.setLocation(location);
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        } catch (final NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "unrecognized IDs", e);
        }
    }

    @GetMapping(CURRENT_GAME_PATH)
    @Nonnull
    public ResponseEntity<Void> getCurrentGame(
            @AuthenticationPrincipal final SpringUser user) {
        if (user == null) {
            /*
             * Must return Not Found rather than Unauthorized, because otherwise
             * web browsers will pop up an authentication dialogue
             */
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Not Found Because Unauthorized");

        }
        final Optional<Identifier> gameId = gameService.getCurrentGameOfUser(user.getId());
        if (gameId.isPresent()) {
            final var headers = new HttpHeaders();
            headers.setLocation(URI.create(GameController.createPathFor(gameId.get())));
            return new ResponseEntity<>(headers, HttpStatus.TEMPORARY_REDIRECT);
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "No current game");
        }
    }

    /**
     * <p>
     * Behaviour of the GET verb for a game players resource.
     * </p>
     * <ul>
     * <li>Returns a (non null) game players container.</li>
     * <li>The {@linkplain Identifier#getScenario() scenario identifier} of the
     * {@linkplain Game#getIdentifier()}  game identifier} of the game players
     * container {@linkplain UUID#equals(Object) is equivalent to} the given
     * scenario ID</li>
     * <li>The {@linkplain Identifier#getCreated() creation time} of the
     * {@linkplain Game#getIdentifier()}  game identifier} of the game players
     * container {@linkplain Instant#equals(Object) is equivalent to} the given
     * creation time</li>
     * </ul>
     *
     * @param user     The authenticated identity of the current user
     * @param scenario The unique ID of the scenario of the game.
     * @param created  The creation time of the game.
     * @return The response.
     * @throws NullPointerException     <ul>
     *                                                                                                               <li>If {@code user} is null.</li>
     *                                                                                                               <li>If {@code scenario} is null.</li>
     *                                                                                                               <li>If {@code created} is null.</li>
     *                                                                                                               </ul>
     * @throws IllegalArgumentException If the {@code user} does not have the
     *                                  {@link Authority#ROLE_MANAGE_GAMES} or
     *                                  {@link Authority#ROLE_PLAYER} roles.
     * @throws ResponseStatusException  With a {@linkplain ResponseStatusException#getStatus() status}
     *                                  of {@linkplain HttpStatus#NOT_FOUND 404 (Not Found)} if there
     *                                  is no game that has {@linkplain Game#getIdentifier()
     *                                  identification information} equivalent to the given
     *                                  {@code scenario} and {@code created}.
     */
    @GetMapping(GAME_PLAYERS_PATH_PATTERN)
    @RolesAllowed({"PLAYER", "MANAGE_GAMES"})
    @Nonnull
    public GamePlayersResponse getGamePlayers(
            @Nonnull @AuthenticationPrincipal final SpringUser user,
            @Nonnull @PathVariable("scenario") final UUID scenario,
            @Nonnull @PathVariable("created") final Instant created) {
        Objects.requireNonNull(user, "user");
        final var id = new Game.Identifier(scenario, created);

        final Optional<Game> gameOptional;
        if (user.getAuthorities().contains(SpringAuthority.ROLE_MANAGE_GAMES)) {
            gameOptional = gameService.getGameAsGameManager(id);
        } else if (user.getAuthorities().contains(SpringAuthority.ROLE_PLAYER)) {
            gameOptional = gameService.getGameAsNonGameManager(id,
                    user.getId());
        } else {
            throw new IllegalArgumentException("Request not permitted for role");
        }

        if (gameOptional.isPresent()) {
            return gameOptional.map(g -> GamePlayersResponse.convertToResponse(id, g)).get();
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "unrecognized IDs");
        }
    }

    /**
     * <p>
     * Add the requesting user as a {@linkplain Game#getUsers() player} of
     * a given game.
     * </p>
     * <ul>
     * <li>Returns a redirect to the game players
     * resource of the game. That is, a response with
     * <ul>
     * <li>A {@linkplain ResponseEntity#getStatusCode() status code} of
     * {@linkplain HttpStatus#FOUND 302 (Found)}</li>
     * <li>A {@linkplain HttpHeaders#getLocation()
     * Location}{@linkplain ResponseEntity#getHeaders() header} giving the
     * {@linkplain #createPathForGamePlayersOf(Identifier) path} of the game
     * players resource.</li>
     * </ul>
     * </li>
     * </ul>
     *
     * @param user     The authenticated identity of the current user
     * @param scenario The unique ID of the scenario of the game.
     * @param created  The creation time of the game.
     * @return The response.
     * @throws NullPointerException    <ul>
     *                                                                                                            <li>If {@code user} is null.</li>
     *                                                                                                            <li>If {@code scenario} is null.</li>
     *                                                                                                            <li>If {@code created} is null.</li>
     *                                                                                                            </ul>
     * @throws ResponseStatusException <ul>
     *                                                                                                            <li>With a {@linkplain ResponseStatusException#getStatus()
     *                                                                                                            status} of {@linkplain HttpStatus#NOT_FOUND 404 (Not Found)} if
     *                                                                                                            there is no game that has {@linkplain Game#getIdentifier()
     *                                                                                                            identification information} equivalent to the given
     *                                                                                                            {@code scenario} and {@code created}.</li>
     *                                                                                                            <li>With a {@linkplain ResponseStatusException#getStatus()
     *                                                                                                            status} of {@linkplain HttpStatus#CONFLICT 409 (Conflict)} if
     *                                                                                                            any of the following are true:
     *                                                                                                            <ul>
     *                                                                                                            <li>If the {@code user} is already playing a different
     *                                                                                                            game.</li>
     *                                                                                                            <li>If the game is not {@linkplain Game#isRecruiting()
     *                                                                                                            recruiting} players.
     *                                                                                                            </ul>
     *                                                                                                            </li>
     *                                                                                                            <li>With a {@linkplain ResponseStatusException#getStatus()
     *                                                                                                            status} of {@linkplain HttpStatus#FORBIDDEN 403 (Forbidden)} if
     *                                                                                                            the {@code user} does not have {@linkplain Authority#ROLE_PLAYER permission} to play
     *                                                                                                            games.</li>
     *                                                                                                            </ul>
     */
    @PostMapping(path = GAME_PLAYERS_PATH_PATTERN, params = {JOIN_PARAM})
    @RolesAllowed("PLAYER")
    @Nonnull
    public ResponseEntity<Void> joinGame(
            @Nonnull @AuthenticationPrincipal final SpringUser user,
            @Nonnull @PathVariable("scenario") final UUID scenario,
            @Nonnull @PathVariable("created") final Instant created) {
        Objects.requireNonNull(user, "user");
        final var game = new Game.Identifier(scenario, created);
        try {
            gameService.userJoinsGame(user.getId(), game);
            final var location = URI.create(createPathForGamePlayersOf(game));
            final var headers = new HttpHeaders();
            headers.setLocation(location);
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        } catch (final NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "unrecognized IDs", e);
        } catch (final IllegalGameStateException
                       | UserAlreadyPlayingException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(),
                    e);
        }
    }

    /**
     * <p>
     * Whether the requesting user can become one of the
     * {@linkplain Game#getUsers() players} of a given game.
     * </p>
     * <p>
     * That is, whether all the following are true.
     * </p>
     * <ul>
     * <li>The{@code user} is the ID of a known user.</li>
     * <li>The {@code game} is the ID of a known game.</li>
     * <li>The {@code user} is not already playing a different game.</li>
     * <li>The {@code user} has
     * {@linkplain Authority#ROLE_PLAYER permission} to play games. Note that the
     * given user need not be the current user.</li>
     * <li>The game is {@linkplain Game#isRecruiting() recruiting}
     * players.</li>
     * </ul>
     *
     * @param user     The authenticated identity of the current user
     * @param scenario The unique ID of the scenario of the game.
     * @param created  The creation time of the game.
     * @throws NullPointerException    <ul>
     *                                                                                                            <li>If {@code user} is null.</li>
     *                                                                                                            <li>If {@code scenario} is null.</li>
     *                                                                                                            <li>If {@code created} is null.</li>
     *                                                                                                            </ul>
     * @throws ResponseStatusException With a {@linkplain ResponseStatusException#getStatus() status}
     *                                 of {@linkplain HttpStatus#NOT_FOUND 404 (Not Found)} if there
     *                                 is no game that has {@linkplain Game#getIdentifier()
     *                                 identification information} equivalent to the given
     *                                 {@code scenario} and {@code created}.
     */
    @GetMapping(path = GAME_PLAYERS_PATH_PATTERN, params = {MAY_JOIN_PARAM})
    @RolesAllowed("PLAYER")
    public boolean mayJoinGame(@Nonnull @AuthenticationPrincipal final SpringUser user,
                               @Nonnull @PathVariable("scenario") final UUID scenario,
                               @Nonnull @PathVariable("created") final Instant created) {
        Objects.requireNonNull(user, "user");
        final var game = new Game.Identifier(scenario, created);
        if (gameService.getGameAsGameManager(game).isPresent()) {
            return gameService.mayUserJoinGame(user.getId(), game);
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "unrecognized IDs");
        }
    }
}
