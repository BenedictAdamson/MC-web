package uk.badamson.mc.service;
/*
 * © Copyright Benedict Adamson 2020.
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
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import javax.annotation.Nonnull;

import uk.badamson.mc.Game;
import uk.badamson.mc.Game.Identifier;
import uk.badamson.mc.repository.GameRepository;

public class GameServiceImpl implements GameService {

   private final GameRepository repository;

   private final Clock clock;

   /**
    * <p>
    * Construct a service that uses a give repository.
    * </p>
    * <ul>
    * <li>The created service has the given {@code repository} as its
    * {@linkplain #getRepository() repository}.</li>
    * <li>The created service has the given {@code clock} as its
    * {@linkplain #getClock() clock}.</li>
    * </ul>
    *
    * @param repository
    *           The repository that this service uses for persistent storage.
    * @param clock
    *           The clock that this service uses to access to the current
    *           {@linkplain Instant instant} (point in time).
    * @throws NullPointerException
    *            <ul>
    *            <li>If {@code repository} is null.</li>
    *            <li>If {@code clock} is null.</li>
    *            </ul>
    */
   public GameServiceImpl(@Nonnull final GameRepository repository,
            @Nonnull final Clock clock) {
      this.repository = Objects.requireNonNull(repository, "repository");
      this.clock = Objects.requireNonNull(clock, "clock");
   }

   @Override
   @Nonnull
   public Game create(@Nonnull final UUID scenario) {
      final var identifier = new Game.Identifier(scenario, Instant.EPOCH);// FIXME
      final var game = new Game(identifier);
      return repository.save(game);
   }

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
   public final Clock getClock() {
      return clock;
   }

   @Override
   public Stream<Instant> getCreationTimesOfGamesOfScenario(
            final UUID scenario) {
      return getGameIdentifiers()
               .filter(id -> scenario.equals(id.getScenario()))
               .map(gameId -> gameId.getCreated());
   }

   @Override
   @Nonnull
   public Optional<Game> getGame(@Nonnull final Game.Identifier id) {
      return repository.findById(id);
   }

   @Override
   @Nonnull
   public Stream<Identifier> getGameIdentifiers() {
      return getGames().map(game -> game.getIdentifier());
   }

   private Stream<Game> getGames() {
      return StreamSupport.stream(repository.findAll().spliterator(), false);
   }

   /**
    * <p>
    * The repository that this service uses for persistent storage.
    * </p>
    * <ul>
    * <li>Always have a (non null) repository.</li>
    * </ul>
    *
    * @return the repository
    */
   @Nonnull
   public final GameRepository getRepository() {
      return repository;
   }

}
