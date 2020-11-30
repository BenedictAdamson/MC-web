package uk.badamson.mc.service;
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

import java.time.Clock;
import java.time.Instant;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

import javax.annotation.Nonnull;

import org.springframework.dao.DataAccessException;

import uk.badamson.mc.Game;
import uk.badamson.mc.Game.Identifier;
import uk.badamson.mc.GamePlayers;

/**
 * <p>
 * The part of the service layer pertaining to games of Mission Command.
 * </p>
 */
public interface GameService {

   /**
    * <p>
    * Create a new game for a given scenario.
    * </p>
    *
    * <h2>Post Conditions</h2>
    * <ul>
    * <li>Always return a (non null) game.</li>
    * <li>The returned game has the given {@code scenario} as the
    * {@linkplain Identifier#getScenario() scenario} of its
    * {@linkplain Game#getIdentifier() identifier}.</li>
    * <li>The returned game has the {@linkplain #getNow() current time} as the
    * {@linkplain Identifier#getCreated() creation time} of its
    * {@linkplain Game#getIdentifier() identifier}.</li>
    * <li>The returned game {@linkplain Game#isRecruiting() is recruiting}
    * players.</li>
    * <li>The returned game can be {@linkplain #getGame(Identifier) retrieved}
    * later, using its {@linkplain Game#getIdentifier() identifier}.</li>
    * </ul>
    *
    * @param scenario
    *           The unique ID of the scenario of interest.
    * @return The created game.
    * @throws NullPointerException
    *            If {@code scenario} is null.
    * @throws NoSuchElementException
    *            If {@code scenario} is not the ID of a recognised scenario.
    *            That is, if {@code scenario} is not one of the
    *            {@linkplain ScenarioService#getScenarioIdentifiers()
    *            identifiers} of the associated
    *            {@linkplain #getScenarioService() scenario service}.
    * @throws DataAccessException
    *            If the service could not create the game because of a problem
    *            accessing a repository.
    */
   @Nonnull
   Game create(@Nonnull UUID scenario)
            throws DataAccessException, NoSuchElementException;

   /**
    * <p>
    * Indicate that a game is not {@linkplain GamePlayers#isRecruiting()
    * recruiting} players (any longer).
    * </p>
    * <p>
    * This mutator is idempotent: the mutator does not have the precondition
    * that the game is recruiting.
    * <ul>
    * <li>Returns a (non null) optional value.</li>
    * <li>Returns either an {@linkplain Optional#isEmpty() empty} value, or a
    * value for which
    * <ul>
    * <li>the {@linkplain GamePlayers#getIdentifier() identifier}
    * {@linkplain Identifier#equals(Object) is equivalent to} the given ID</li>
    * <li>the game is not {@linkplain GamePlayers#isRecruiting()
    * recruiting}.</li>
    * </ul>
    * </li>
    * <li>Subsequent {@linkplain #getGamePlayers(Identifier) retrieval} of the
    * game players using an identifier equivalent to the given ID returns a
    * value that is also not recruiting. That is, the method also saves the
    * mutated value.</li>
    * </ul>
    *
    * @param id
    *           The unique ID of the game to mutate.
    * @return The mutated game players information.
    * @throws NullPointerException
    *            If {@code id} is null.
    */
   @Nonnull
   Optional<GamePlayers> endRecruitment(@Nonnull final Game.Identifier id);

   /**
    * <p>
    * The clock that this service uses to access to the current
    * {@linkplain Instant instant} (point in time).
    * </p>
    * <ul>
    * <li>Not null.</li>
    * </ul>
    *
    * @return the clock
    */
   @Nonnull
   Clock getClock();

   /**
    * <p>
    * Retrieve a stream of the creation times of the games that are for a given
    * scenario.
    * </p>
    * <p>
    * The given {@code scenario} ID could be combined with the returned creation
    * times to create the {@linkplain Identifier identifiers} of the games for
    * the given scenario.
    * </p>
    * <ul>
    * <li>Always returns a (non null) stream.</li>
    * <li>The returned stream will not include a null element</li>
    * <li>Does not contain {@linkplain Instant#equals(Object) duplicate}
    * identifiers.</li>
    * </ul>
    *
    * @param scenario
    *           The unique ID of the scenario of interest.
    * @return The creation times
    * @throws NullPointerException
    *            If {@code scenario} is null.
    * @throws NoSuchElementException
    *            If {@code scenario} is not the ID of a recognised scenario.
    *            That is, if {@code scenario} is not one of the
    *            {@linkplain ScenarioService#getScenarioIdentifiers()
    *            identifiers} of the associated
    *            {@linkplain #getScenarioService() scenario service}.
    */
   @Nonnull
   Stream<Instant> getCreationTimesOfGamesOfScenario(@Nonnull UUID scenario)
            throws NoSuchElementException;

   /**
    * <p>
    * Retrieve the game that has a given unique ID.
    * </p>
    * <ul>
    * <li>Returns a (non null) optional value.</li>
    * <li>Returns either an {@linkplain Optional#isEmpty() empty} value, or a
    * value for which the {@linkplain Game#getIdentifier() identifier}
    * {@linkplain Identifier#equals(Object) is equivalent to} the given ID</li>
    * </ul>
    *
    * @param id
    *           The unique ID of the wanted game.
    * @return The game.
    * @throws NullPointerException
    *            If {@code id} is null.
    */
   @Nonnull
   Optional<Game> getGame(@Nonnull final Game.Identifier id);

   /**
    * <p>
    * Retrieve a stream of the identifiers of all the games of this instance of
    * the Mission Command game.
    * </p>
    * <ul>
    * <li>Always returns a (non null) stream.</li>
    * <li>The returned stream will not include a null element</li>
    * <li>Does not contain {@linkplain Identifier#equals(Object) duplicate}
    * identifiers.</li>
    * </ul>
    *
    * @return a {@linkplain Stream stream} of the game identifiers.
    */
   @Nonnull
   Stream<Game.Identifier> getGameIdentifiers();

   /**
    * <p>
    * Retrieve the current point in time, using the {@linkplain #getClock()
    * clock} associated with this service, truncated to practical precision.
    * </p>
    * <ul>
    * <li>Not null</li>
    * </ul>
    * <p>
    * Ideally, we would simply delegate to {@link Clock#instant()}.
    * Unfortunately, some repository implementations (including the MongoDB
    * Spring Data repository) can not store very high precision time-stamps, but
    * are limited to millisecond precision. So we must truncate any excess
    * precision in some cases.
    * </p>
    *
    * @return the current time.
    */

   @Nonnull
   Instant getNow();

   /**
    * <p>
    * The part of the service layer that this service uses for information about
    * scenarios.
    * </p>
    * <ul>
    * <li>Not null.</li>
    * </ul>
    *
    * @return the scenario service
    */
   @Nonnull
   ScenarioService getScenarioService();
}
