package uk.badamson.mc.service;
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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasEntry;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.EnumSet;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import uk.badamson.dbc.assertions.ObjectVerifier;
import uk.badamson.mc.*;
import uk.badamson.mc.Game.Identifier;
import uk.badamson.mc.repository.CurrentUserGameSpringRepository;
import uk.badamson.mc.repository.CurrentUserGameRepositoryTest;
import uk.badamson.mc.repository.GamePlayersSpringRepository;
import uk.badamson.mc.repository.GamePlayersRepositoryTest;
import uk.badamson.mc.repository.GameRepositoryTest;
import uk.badamson.mc.repository.UserSpringRepository;
import uk.badamson.mc.repository.UserRepositoryTest;

import javax.annotation.Nonnull;

public class GamePlayersServiceImplTest {
   @Nested
   public class Constructor {

      @Test
      public void a() {
         constructor(gamePlayersRepositoryA, currentUserGameRepositoryA,
                  gameServiceA, userServiceA);
      }

      @Test
      public void b() {
         constructor(gamePlayersRepositoryB, currentUserGameRepositoryB,
                  gameServiceB, userServiceB);
      }
   }

   @Nested
   public class EndRecruitment {

      @Nested
      public class InRepository {

         @Test
         public void a() {
            test(true, Map.of());
         }

         @Test
         public void b() {
            test(false, Map.of(CHARACTER_ID_A, USER_ID_A));
         }

         @Test
         public void c() {
            test(true, Map.of(CHARACTER_ID_B, USER_ID_B));
         }

         private void test(final boolean recruiting0,
                  final Map<UUID, UUID> users) {
            final var gamePlayersRepository = gamePlayersRepositoryA;
            final var currentUserGameRepository = currentUserGameRepositoryA;
            final var gameService = gameServiceA;

            final var scenario = getAScenarioId(gameService);
            final var game = gameService.create(scenario);
            final var id = game.getIdentifier();
            final var gamePlayersInRepository = new GamePlayers(id, recruiting0,
                     users);
            gamePlayersRepository.save(gamePlayersInRepository);
            final var service = new GamePlayersServiceImpl(
                     gamePlayersRepository, currentUserGameRepository,
                     gameService, userServiceA);

            final var gamePlayers = endRecruitment(service, id);

            assertAll("Attributes of returned value",
                     () -> assertThat("game", gamePlayers.getGame(), is(id)),
                     () -> assertThat("recruiting", gamePlayers.isRecruiting(),
                              is(false)),
                     () -> assertThat("users", gamePlayers.getUsers(),
                              is(users)));
         }
      }

      @Nested
      public class NoSuchGame {
         @Test
         public void a() {
            test(GAME_IDENTIFIER_A);
         }

         @Test
         public void b() {
            test(GAME_IDENTIFIER_B);
         }

         @Test
         public void inRepository() {
            final var gamePlayersRepository = gamePlayersRepositoryA;
            final var currentUserGameRepository = currentUserGameRepositoryA;
            final var gameService = gameServiceA;

            // Tough test: a valid scenario ID
            final var scenario = getAScenarioId(gameService);
            final var id = new Game.Identifier(scenario, Instant.EPOCH);
            final var gamePlayersInrepository = new GamePlayers(id, true,
                     Map.of());
            gamePlayersRepository.save(gamePlayersInrepository);
            final var service = new GamePlayersServiceImpl(
                     gamePlayersRepository, currentUserGameRepository,
                     gameService, userServiceA);

            assertThrows(NoSuchElementException.class,
                     () -> endRecruitment(service, id));
         }

         private void test(final Game.Identifier id) {
            final var service = new GamePlayersServiceImpl(
                     gamePlayersRepositoryA, currentUserGameRepositoryA,
                     gameServiceA, userServiceA);

            assertThrows(NoSuchElementException.class,
                     () -> endRecruitment(service, id));
         }

      }

      @Test
      public void notInRepository() {
         final var gameService = gameServiceA;
         final var scenario = getAScenarioId(gameService);
         final var game = gameService.create(scenario);
         final var id = game.getIdentifier();
         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameService, userServiceA);

         final var gamePlayers = endRecruitment(service, id);

         assertAll("Changed default",
                  () -> assertThat("recruiting", gamePlayers.isRecruiting(),
                           is(false)),
                  () -> assertThat("users", gamePlayers.getUsers().entrySet(),
                           empty()));
      }
   }

   @Nested
   public class GetCurrentGameOfUser {

      @Test
      public void unknownUser() {
         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameServiceA, userServiceA);

         final var result = getCurrentGameOfUser(service, USER_ID_A);

         assertTrue(result.isEmpty(), "empty");
      }

      @Test
      public void unknownUserWithRecord() {
         final var userId = USER_ID_A;
         final var currentUserGameRepository = currentUserGameRepositoryA;
         currentUserGameRepository
                  .save(new UserGameAssociation(userId, GAME_IDENTIFIER_A));
         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepository, gameServiceA, userServiceA);

         final var result = getCurrentGameOfUser(service, userId);

         assertTrue(result.isEmpty(), "empty");
      }
   }

   @Nested
   public class GetGamePlayersAsGameManager {

      @Nested
      public class InRepository {

         @Test
         public void a() {
            test(true, Map.of());
         }

         @Test
         public void b() {
            test(false, Map.of(CHARACTER_ID_A, USER_ID_A));
         }

         private void test(final boolean recruiting,
                  final Map<UUID, UUID> users) {
            final var gameService = gameServiceA;
            final var gamePlayersRepository = gamePlayersRepositoryA;
            final var scenario = getAScenarioId(gameService);
            final var game = gameService.create(scenario);
            final var id = game.getIdentifier();
            final var gamePlayersInrepository = new GamePlayers(id, recruiting,
                     users);
            gamePlayersRepository.save(gamePlayersInrepository);
            final var service = new GamePlayersServiceImpl(
                     gamePlayersRepository, currentUserGameRepositoryA,
                     gameService, userServiceA);

            final var result = getGamePlayersAsGameManager(service, id);

            assertTrue(result.isPresent(), "present");// guard
            final var gamePlayers = result.get();
            assertAll("Attributes of returned value",
                     () -> assertThat("game", gamePlayers.getGame(), is(id)),
                     () -> assertThat("recruiting", gamePlayers.isRecruiting(),
                              is(recruiting)),
                     () -> assertThat("users", gamePlayers.getUsers(),
                              is(users)));
         }
      }

      @Nested
      public class NoSuchGame {
         @Test
         public void a() {
            test(GAME_IDENTIFIER_A);
         }

         @Test
         public void b() {
            test(GAME_IDENTIFIER_B);
         }

         @Test
         public void inRepository() {
            final var gameService = gameServiceA;
            final var gamePlayersRepository = gamePlayersRepositoryA;
            // Tough test: a valid scenario ID
            final var scenario = getAScenarioId(gameService);
            final var id = new Game.Identifier(scenario, Instant.EPOCH);
            final var gamePlayersInrepository = new GamePlayers(id, true,
                     Map.of());
            gamePlayersRepository.save(gamePlayersInrepository);
            final var service = new GamePlayersServiceImpl(
                     gamePlayersRepository, currentUserGameRepositoryA,
                     gameService, userServiceA);

            final var result = getGamePlayersAsGameManager(service, id);

            assertTrue(result.isEmpty(), "empty");
         }

         private void test(final Game.Identifier id) {
            final var service = new GamePlayersServiceImpl(
                     gamePlayersRepositoryA, currentUserGameRepositoryA,
                     gameServiceA, userServiceA);

            final var result = getGamePlayersAsGameManager(service, id);

            assertTrue(result.isEmpty(), "empty");
         }

      }

      @Test
      public void notInRepository() {
         final var gameService = gameServiceA;
         final var scenario = getAScenarioId(gameService);
         final var game = gameService.create(scenario).getIdentifier();
         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameService, userServiceA);

         final var result = getGamePlayersAsGameManager(service, game);

         assertTrue(result.isPresent(), "present");// guard
         final var gamePlayers = result.get();
         assertIsDefault(gamePlayers);
      }
   }

   @Nested
   public class GetGamePlayersAsNonGameManager {

      @Nested
      public class InRepository {

         @Test
         public void noPlayers() {
            test(true, Map.of(), USER_ID_A, Map.of());
         }

         @Test
         public void notPlayer() {
            test(false, Map.of(CHARACTER_ID_A, USER_ID_A), USER_ID_B, Map.of());
         }

         @Test
         public void solePlayer() {
            test(false, Map.of(CHARACTER_ID_A, USER_ID_A), USER_ID_A,
                     Map.of(CHARACTER_ID_A, USER_ID_A));
         }

         private void test(final boolean recruiting,
                  final Map<UUID, UUID> users, final UUID user,
                  final Map<UUID, UUID> expectedUsers) {
            final var gameService = gameServiceA;
            final var gamePlayersRepository = gamePlayersRepositoryA;
            final var scenario = getAScenarioId(gameService);
            final var game = gameService.create(scenario);
            final var id = game.getIdentifier();
            final var gamePlayersInrepository = new GamePlayers(id, recruiting,
                     users);
            gamePlayersRepository.save(gamePlayersInrepository);
            final var service = new GamePlayersServiceImpl(
                     gamePlayersRepository, currentUserGameRepositoryA,
                     gameService, userServiceA);

            final var result = getGamePlayersAsNonGameManager(service, id,
                     user);

            assertTrue(result.isPresent(), "present");// guard
            final var gamePlayers = result.get();
            assertAll("Attributes of returned value",
                     () -> assertThat("game", gamePlayers.getGame(), is(id)),
                     () -> assertThat("recruiting", gamePlayers.isRecruiting(),
                              is(recruiting)),
                     () -> assertThat("users", gamePlayers.getUsers(),
                              is(expectedUsers)));
         }
      }

      @Nested
      public class NoSuchGame {
         @Test
         public void a() {
            test(GAME_IDENTIFIER_A, USER_ID_A);
         }

         @Test
         public void b() {
            test(GAME_IDENTIFIER_B, USER_ID_B);
         }

         @Test
         public void inRepository() {
            final var gameService = gameServiceA;
            final var gamePlayersRepository = gamePlayersRepositoryA;
            // Tough test: a valid scenario ID
            final var scenario = getAScenarioId(gameService);
            final var id = new Game.Identifier(scenario, Instant.EPOCH);
            final var gamePlayersInrepository = new GamePlayers(id, true,
                     Map.of());
            gamePlayersRepository.save(gamePlayersInrepository);
            final var service = new GamePlayersServiceImpl(
                     gamePlayersRepository, currentUserGameRepositoryA,
                     gameService, userServiceA);

            final var result = getGamePlayersAsNonGameManager(service, id,
                     USER_ID_A);

            assertTrue(result.isEmpty(), "empty");
         }

         private void test(final Game.Identifier id, final UUID user) {
            final var service = new GamePlayersServiceImpl(
                     gamePlayersRepositoryA, currentUserGameRepositoryA,
                     gameServiceA, userServiceA);

            final var result = getGamePlayersAsNonGameManager(service, id,
                     user);

            assertTrue(result.isEmpty(), "empty");
         }

      }

      @Test
      public void notInRepository() {
         final var gameService = gameServiceA;
         final var scenario = getAScenarioId(gameService);
         final var game = gameService.create(scenario).getIdentifier();
         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameService, userServiceA);

         final var result = getGamePlayersAsNonGameManager(service, game,
                  USER_ID_A);

         assertTrue(result.isPresent(), "present");// guard
         final var gamePlayers = result.get();
         assertIsDefault(gamePlayers);
      }
   }

   @Nested
   public class MayUserJoinGame {

      @Test
      public void gameNotRecuiting() {
         final var gameService = gameServiceA;
         final var userService = userServiceA;
         final var scenario = getAScenarioId(gameService);
         final var game = gameService.create(scenario).getIdentifier();
         // Tough test: user exists and is permitted
         final var user = userService.add(new BasicUserDetails(USERNAME_A,
                  PASSWORD_A, Authority.ALL, true, true, true, true)).getId();

         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameService, userService);
         service.endRecruitment(game);

         assertFalse(mayUserJoinGame(service, user, game));
      }

      @Test
      public void may() {
         final var gameService = gameServiceA;
         final var userService = userServiceA;
         final var scenario = getAScenarioId(gameService);
         final var game = gameService.create(scenario).getIdentifier();
         // Tough test: user has minimum permission
         final var user = userService.add(new BasicUserDetails(USERNAME_A,
                  PASSWORD_A, Set.of(Authority.ROLE_PLAYER), true, true, true,
                  true)).getId();

         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameService, userService);

         assertTrue(mayUserJoinGame(service, user, game));
      }

      @Test
      public void unknownGame() {
         final var userService = userServiceA;
         // Tough test: user exists and is permitted
         final var user = userService.add(new BasicUserDetails(USERNAME_A,
                  PASSWORD_A, Authority.ALL, true, true, true, true)).getId();
         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameServiceA, userService);

         assertFalse(mayUserJoinGame(service, user, GAME_IDENTIFIER_A));
      }

      @Test
      public void unknownUser() {
         // Tough test: game exists and is recruiting
         final var gameService = gameServiceA;
         final var scenario = getAScenarioId(gameService);
         final var game = gameService.create(scenario).getIdentifier();
         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameService, userServiceA);

         assertFalse(mayUserJoinGame(service, USER_ID_A, game));
      }

      @Test
      public void userAlreadyPlayingDifferentGame() {
         final var gameService = gameServiceA;
         final var userService = userServiceA;
         final var scenario = getAScenarioId(gameService);
         final var gameA = gameService.create(scenario).getIdentifier();
         final var gameB = gameService.create(scenario).getIdentifier();
         assert !gameA.equals(gameB);
         final var user = userService.add(new BasicUserDetails(USERNAME_A,
                  PASSWORD_A, Authority.ALL, true, true, true, true)).getId();

         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameService, userService);
         service.userJoinsGame(user, gameA);

         assertFalse(mayUserJoinGame(service, user, gameB));
      }

      @Test
      public void userAlreadyPlayingSameGame() {
         final var gameService = gameServiceA;
         final var userService = userServiceA;
         final var scenario = getAScenarioId(gameService);
         final var game = gameService.create(scenario).getIdentifier();
         final var user = userService.add(new BasicUserDetails(USERNAME_A,
                  PASSWORD_A, Authority.ALL, true, true, true, true)).getId();

         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameService, userService);
         service.userJoinsGame(user, game);

         assertTrue(mayUserJoinGame(service, user, game));
      }

      @Test
      public void userNotPermitted() {
         final var gameService = gameServiceA;
         final var userService = userServiceA;
         // Tough test: game exists and is recruiting
         final var scenario = getAScenarioId(gameService);
         final var game = gameService.create(scenario).getIdentifier();
         // Tough test: user has all other permissions
         final Set<Authority> authorities = EnumSet
                  .complementOf(EnumSet.of(Authority.ROLE_PLAYER));
         final var user = userService.add(new BasicUserDetails(USERNAME_A,
                  PASSWORD_A, authorities, true, true, true, true)).getId();

         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameService, userService);

         assertFalse(mayUserJoinGame(service, user, game));
      }
   }

   @Nested
   public class UserJoinsGame {

      @Nested
      public class Valid {

         @Test
         public void last() {
            final var gameService = gameServiceA;
            final var userService = userServiceA;
            final var scenarioService = gameService.getScenarioService();
            final var scenarioId = getAScenarioId(gameService);
            final Optional<Scenario> scenarioOptional = scenarioService.getScenario(scenarioId);
            assertThat("scenario", scenarioOptional.isPresent());
            final var scenario = scenarioOptional.get();
            final var nCharacters = scenario.getCharacters().size();
            final var game = gameService.create(scenarioId).getIdentifier();
            final var service = new GamePlayersServiceImpl(
                     gamePlayersRepositoryA, currentUserGameRepositoryA,
                     gameService, userService);
            for (var c = 0; c < nCharacters - 1; ++c) {
               final var userName = "User " + c;
               final var user = userService.add(new BasicUserDetails(userName,
                        PASSWORD_A, Set.of(Authority.ROLE_PLAYER), true, true,
                        true, true)).getId();
               service.userJoinsGame(user, game);
            }
            final var user = userService.add(new BasicUserDetails(USERNAME_B,
                     PASSWORD_B, Set.of(Authority.ROLE_PLAYER), true, true,
                     true, true)).getId();

            test(service, user, game);

            final Optional<GamePlayers> gamePlayersOptional = service.getGamePlayersAsGameManager(game);
            assertThat("gamePlayers", gamePlayersOptional.isPresent());
            final var gamePlayers = gamePlayersOptional.get();
            assertThat("Game is not recruiting", gamePlayers.isRecruiting(),
                     is(false));
         }

         @Test
         public void one() {
            final var gameService = gameServiceA;
            final var userService = userServiceA;
            final var scenarioId = getAScenarioId(gameService);
            final var game = gameService.create(scenarioId).getIdentifier();
            // Tough test: user has minimum permission
            final var user = userService.add(new BasicUserDetails(USERNAME_A,
                     PASSWORD_A, Set.of(Authority.ROLE_PLAYER), true, true,
                     true, true)).getId();

            final var service = new GamePlayersServiceImpl(
                     gamePlayersRepositoryA, currentUserGameRepositoryA,
                     gameService, userService);

            test(service, user, game);
         }

         private void test(final GamePlayersServiceImpl gamePlayersService,
                  final UUID user, final Game.Identifier game) {
            final var scenarioService = gamePlayersService.getGameService()
                     .getScenarioService();
            final Optional<Scenario> scenarioOptional = scenarioService.getScenario(game.getScenario());
            assertThat("scenario", scenarioOptional.isPresent());
            final var scenario = scenarioOptional.get();
            final var characterIds = scenario.getCharacters().stream()
                    .sequential().map(NamedUUID::getId).toList();
            final Optional<GamePlayers> gamePlayers0Optional = gamePlayersService
                    .getGamePlayersAsGameManager(game);
            assertThat("gamePlayers", gamePlayers0Optional.isPresent());
            final var gamePlayers0 = gamePlayers0Optional.get();
            final var playedCharacters0 = gamePlayers0.getUsers().keySet();
            final Optional<UUID> firstUnplayedCharacter0Optional = characterIds.stream()
                    .sequential().filter(c -> !playedCharacters0.contains(c))
                    .findFirst();
            assertThat("firstUnplayedCharacter", firstUnplayedCharacter0Optional.isPresent());
            final var firstUnplayedCharacter0 = firstUnplayedCharacter0Optional.get();

            userJoinsGame(gamePlayersService, user, game);

            final Optional<Identifier> currentGameOptional = gamePlayersService
                    .getCurrentGameOfUser(user);
            assertThat("currentGame", currentGameOptional.isPresent());
            final var currentGame = currentGameOptional.get();
            final Optional<GamePlayers> gamePlayersOptional = gamePlayersService
                    .getGamePlayersAsGameManager(game);
            assertThat("gamePlayers", gamePlayersOptional.isPresent());
            final var gamePlayers = gamePlayersOptional.get();
            final var users = gamePlayers.getUsers();
            assertThat("The current game of the user becomes the given game.",
                     currentGame, is(game));
            assertAll("The played characters of the game",
                     () -> assertTrue(characterIds.containsAll(users.keySet()),
                              "is a subset of the characters of the scenario."),
                     () -> assertThat("has the user as a player",
                              users.values(), hasItem(user)),
                     () -> assertThat(
                              "has the user as the player of the first unplayed character",
                              users, hasEntry(firstUnplayedCharacter0, user)));
            assertThat(
                     "If the scenario can not allow any more players the game is no longer recruiting players.",
                     gamePlayers.isRecruiting(),
                     is(users.size() < characterIds.size()));
         }

         @Test
         public void two() {
            final var gameService = gameServiceA;
            final var userService = userServiceA;
            final var scenarioId = getAScenarioId(gameService);
            final var game = gameService.create(scenarioId).getIdentifier();
            final var userA = userService.add(new BasicUserDetails(USERNAME_A,
                     PASSWORD_A, Set.of(Authority.ROLE_PLAYER), true, true,
                     true, true)).getId();
            final var userB = userService.add(new BasicUserDetails(USERNAME_B,
                     PASSWORD_B, Set.of(Authority.ROLE_PLAYER), true, true,
                     true, true)).getId();

            final var service = new GamePlayersServiceImpl(
                     gamePlayersRepositoryA, currentUserGameRepositoryA,
                     gameService, userService);
            service.userJoinsGame(userA, game);

            test(service, userB, game);

            final Optional<GamePlayers> gamePlayersOptional = service.getGamePlayersAsGameManager(game);
            assertThat("gamePlayers", gamePlayersOptional.isPresent());
            final var gamePlayers = gamePlayersOptional.get();
            final var users = gamePlayers.getUsers();
            assertThat("Previous player is (still) a player", users.values(),
                     hasItem(userA));
         }

      }

      @Test
      public void gameNotRecuiting() {
         final var gameService = gameServiceA;
         final var userService = userServiceA;
         final var scenario = getAScenarioId(gameService);
         final var game = gameService.create(scenario).getIdentifier();
         // Tough test: user exists and is permitted
         final var user = userService.add(new BasicUserDetails(USERNAME_A,
                  PASSWORD_A, Authority.ALL, true, true, true, true)).getId();

         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameService, userService);
         service.endRecruitment(game);

         assertThrows(IllegalGameStateException.class,
                  () -> userJoinsGame(service, user, game));
      }

      @Test
      public void unknownGame() {
         final var userService = userServiceA;
         // Tough test: user exists and is permitted
         final var user = userService.add(new BasicUserDetails(USERNAME_A,
                  PASSWORD_A, Authority.ALL, true, true, true, true));
         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameServiceA, userService);

         assertThrows(NoSuchElementException.class, () -> userJoinsGame(service,
                  user.getId(), GAME_IDENTIFIER_A));
      }

      @Test
      public void unknownUser() {
         // Tough test: game exists and is recruiting
         final var gameService = gameServiceA;
         final var scenario = getAScenarioId(gameService);
         final var game = gameService.create(scenario).getIdentifier();
         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameService, userServiceA);

         assertThrows(NoSuchElementException.class,
                  () -> userJoinsGame(service, USER_ID_A, game));
      }

      @Test
      public void userAlreadyPlayingDifferentGame() {
         final var gameService = gameServiceA;
         final var userService = userServiceA;
         final var scenario = getAScenarioId(gameService);
         final var gameA = gameService.create(scenario).getIdentifier();
         final var gameB = gameService.create(scenario).getIdentifier();
         assert !gameA.equals(gameB);
         final var user = userService.add(new BasicUserDetails(USERNAME_A,
                  PASSWORD_A, Authority.ALL, true, true, true, true)).getId();

         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameService, userService);
         service.userJoinsGame(user, gameA);

         assertThrows(UserAlreadyPlayingException.class,
                  () -> userJoinsGame(service, user, gameB));
      }

      @Test
      public void userAlreadyPlayingSameGame() {
         final var gameService = gameServiceA;
         final var userService = userServiceA;
         final var scenario = getAScenarioId(gameService);
         final var game = gameService.create(scenario).getIdentifier();
         final var user = userService.add(new BasicUserDetails(USERNAME_A,
                  PASSWORD_A, Authority.ALL, true, true, true, true)).getId();

         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameService, userService);
         service.userJoinsGame(user, game);

         userJoinsGame(service, user, game);

         final Optional<Identifier> currentGameOptional = service.getCurrentGameOfUser(user);
         assertThat("currentGame", currentGameOptional.isPresent());
         final var currentGame = currentGameOptional.get();
         final Optional<GamePlayers> gamePlayersOptional = service.getGamePlayersAsGameManager(game);
         assertThat("gamePlayers", gamePlayersOptional.isPresent());
         final var gamePlayers = gamePlayersOptional.get();
         assertThat("The current game of the user is (still) the given game.",
                  currentGame, is(game));
         assertThat("The players of the game (still) includes the user.",
                  gamePlayers.getUsers().values(), hasItem(user));
      }

      @Test
      public void userNotPermitted() {
         final var gameService = gameServiceA;
         final var userService = userServiceA;
         // Tough test: game exists and is recruiting
         final var scenario = getAScenarioId(gameService);
         final var game = gameService.create(scenario).getIdentifier();
         // Tough test: user has all other permissions
         final Set<Authority> authorities = EnumSet
                  .complementOf(EnumSet.of(Authority.ROLE_PLAYER));
         final var user = userService.add(new BasicUserDetails(USERNAME_A,
                  PASSWORD_A, authorities, true, true, true, true)).getId();

         final var service = new GamePlayersServiceImpl(gamePlayersRepositoryA,
                  currentUserGameRepositoryA, gameService, userService);

         assertThrows(SecurityException.class,
                  () -> userJoinsGame(service, user, game));
      }

   }

   private static final ZoneId UTC = ZoneId.from(ZoneOffset.UTC);

   /*
    * Guaranteed to produce a different time Instant each time used.
    */
   private static final Clock CLOCK_A = new Clock() {

      private long seconds = 0L;

      @Override
      public ZoneId getZone() {
         return UTC;
      }

      @Override
      public Instant instant() {
         return Instant.ofEpochSecond(seconds++);
      }

      @Override
      public Clock withZone(final ZoneId zone) {
         throw new UnsupportedOperationException();
      }

   };

   private static final Clock CLOCK_B = Clock.fixed(Instant.EPOCH, UTC);

   private static final UUID CHARACTER_ID_A = UUID.randomUUID();

   private static final UUID CHARACTER_ID_B = UUID.randomUUID();

   private static final UUID USER_ID_A = UUID.randomUUID();

   private static final UUID USER_ID_B = UUID.randomUUID();

   private static final String USERNAME_A = "John";

   private static final String USERNAME_B = "Paul";

   private static final String PASSWORD_A = "letmein";

   private static final String PASSWORD_B = "password123";

   private static final Game.Identifier GAME_IDENTIFIER_A = new Game.Identifier(
            UUID.randomUUID(), Instant.EPOCH);

   private static final Game.Identifier GAME_IDENTIFIER_B = new Game.Identifier(
            UUID.randomUUID(), Instant.now());

   public static void assertInvariants(final GamePlayersServiceImpl service) {
      ObjectVerifier.assertInvariants(service);// inherited
      GamePlayersServiceTest.assertInvariants(service);// inherited

      assertNotNull(service.getGamePlayersRepository(),
               "Not null, gamePlayersRepository");
   }

   private static void assertIsDefault(final GamePlayers gamePlayers) {
      assertAll("Default",
               () -> assertTrue(gamePlayers.isRecruiting(), "recruiting"),
               () -> assertThat("users", gamePlayers.getUsers().entrySet(),
                        empty()));
   }

   private static void constructor(
            final GamePlayersSpringRepository gamePlayersRepository,
            final CurrentUserGameSpringRepository currentUserGameRepository,
            final GameService gameService, final UserService userService) {
      final var service = new GamePlayersServiceImpl(gamePlayersRepository,
               currentUserGameRepository, gameService, userService);

      assertInvariants(service);
      assertAll("Has the given assoications",
               () -> assertSame(gamePlayersRepository,
                        service.getGamePlayersRepository(),
                        "gamePlayersRepository"),
               () -> assertSame(currentUserGameRepository,
                        service.getCurrentUserGameRepository(),
                        "currentUserGameRepository"),
               () -> assertSame(gameService, service.getGameService(),
                        "gameService"),
               () -> assertSame(userService, service.getUserService(),
                        "userService"));

   }

   public static GamePlayers endRecruitment(
            final GamePlayersServiceImpl service, final Game.Identifier id)
            throws NoSuchElementException {
      final GamePlayers result;
      try {
         result = GamePlayersServiceTest.endRecruitment(service, id);
      } catch (final NoSuchElementException e) {
         assertInvariants(service);
         throw e;
      }
      assertInvariants(service);
      return result;
   }

   public static Optional<Game.Identifier> getCurrentGameOfUser(
            final GamePlayersServiceImpl service, final UUID user) {
      final var result = GamePlayersServiceTest.getCurrentGameOfUser(service,
               user);
      assertInvariants(service);
      return result;
   }

   public static Optional<GamePlayers> getGamePlayersAsGameManager(
            final GamePlayersServiceImpl service, final Game.Identifier id) {
      final boolean gameExists = service.getGameService().getGame(id)
               .isPresent();

      final var result = GamePlayersServiceTest
               .getGamePlayersAsGameManager(service, id);// inherited

      assertInvariants(service);
      final var repositoryResult = service.getGamePlayersRepository()
               .findById(id);
      assertThat("Uses value from the repository, if there is one",
               !gameExists || repositoryResult.isEmpty()
                        || result.equals(repositoryResult));

      return result;
   }

   public static Optional<GamePlayers> getGamePlayersAsNonGameManager(
            final GamePlayersServiceImpl service, final Game.Identifier id,
            final UUID user) {
      final var result = GamePlayersServiceTest
               .getGamePlayersAsNonGameManager(service, id, user);// inherited
      assertInvariants(service);
      return result;
   }

   public static boolean mayUserJoinGame(final GamePlayersServiceImpl service,
            final UUID user, final Identifier game) {
      final var result = GamePlayersServiceTest.mayUserJoinGame(service, user,
               game);// inherited
      assertInvariants(service);
      return result;
   }

   public static void userJoinsGame(final GamePlayersServiceImpl service,
            final UUID user, final Game.Identifier game)
            throws NoSuchElementException, UserAlreadyPlayingException,
            IllegalGameStateException, SecurityException {
      try {
         GamePlayersServiceTest.userJoinsGame(service, user, game);// inherited
      } catch (UserAlreadyPlayingException | IllegalGameStateException
               | SecurityException | NoSuchElementException e) {
         assertInvariants(service);
         throw e;
      }
      assertInvariants(service);
   }

   private final PasswordEncoder passwordEncoderA = new BCryptPasswordEncoder(
            4);

   private final PasswordEncoder passwordEncoderB = new BCryptPasswordEncoder(
            5);

   private final ScenarioService scenarioServiceA = new ScenarioServiceImpl();

   private final ScenarioService scenarioServiceB = new ScenarioServiceImpl();

   private GamePlayersRepositoryTest.Fake gamePlayersRepositoryA;

   private GamePlayersRepositoryTest.Fake gamePlayersRepositoryB;

   private CurrentUserGameRepositoryTest.Fake currentUserGameRepositoryA;

   private CurrentUserGameRepositoryTest.Fake currentUserGameRepositoryB;

   private GameService gameServiceA;

   private GameService gameServiceB;

   private UserService userServiceA;

   private UserService userServiceB;

   private static UUID getAScenarioId(@Nonnull  GameService gameService) {
      final Optional<UUID> scenarioOptional = gameService.getScenarioService()
              .getScenarioIdentifiers().findAny();
      assertThat("scenario", scenarioOptional.isPresent());
      return scenarioOptional.get();
   }

   @BeforeEach
   public void setUp() {
      GameRepositoryTest.Fake gameRepositoryA = new GameRepositoryTest.Fake();
      GameRepositoryTest.Fake gameRepositoryB = new GameRepositoryTest.Fake();
      gamePlayersRepositoryA = new GamePlayersRepositoryTest.Fake();
      gamePlayersRepositoryB = new GamePlayersRepositoryTest.Fake();
      currentUserGameRepositoryA = new CurrentUserGameRepositoryTest.Fake();
      currentUserGameRepositoryB = new CurrentUserGameRepositoryTest.Fake();
      UserSpringRepository userRepositoryA = new UserRepositoryTest.Fake();
      UserSpringRepository userRepositoryB = new UserRepositoryTest.Fake();

      gameServiceA = new GameServiceImpl(gameRepositoryA, CLOCK_A,
               scenarioServiceA);
      gameServiceB = new GameServiceImpl(gameRepositoryB, CLOCK_B,
               scenarioServiceB);
      userServiceA = new UserServiceImpl(passwordEncoderA, userRepositoryA,
               PASSWORD_A);
      userServiceB = new UserServiceImpl(passwordEncoderB, userRepositoryB,
               PASSWORD_B);
   }
}
