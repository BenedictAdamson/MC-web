package uk.badamson.mc.service;
/*
 * © Copyright Benedict Adamson 2020-22.
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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.badamson.mc.Game;
import uk.badamson.mc.Game.Identifier;
import uk.badamson.mc.GamePlayers;
import uk.badamson.mc.repository.CurrentUserGameRepositoryAdapter;
import uk.badamson.mc.repository.CurrentUserGameSpringRepository;
import uk.badamson.mc.repository.GamePlayersRepositoryAdapter;
import uk.badamson.mc.repository.GamePlayersSpringRepository;

import javax.annotation.Nonnull;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Service
public class GamePlayersSpringService {

    private final GamePlayersService delegate;


    @Autowired
    public GamePlayersSpringService(
            @Nonnull final GamePlayersSpringRepository gamePlayersRepository,
            @Nonnull final CurrentUserGameSpringRepository currentUserGameRepository,
            @Nonnull final GameSpringService gameService,
            @Nonnull final UserSpringService userService) {
        this.delegate = new GamePlayersService(
                new GamePlayersRepositoryAdapter(gamePlayersRepository),
                new CurrentUserGameRepositoryAdapter(currentUserGameRepository),
                gameService.getDelegate(),
                userService.getDelegate()
        );
    }

    @Nonnull
    public void endRecruitment(@Nonnull final Identifier id)
            throws NoSuchElementException {
        delegate.endRecruitment(id);
    }

    @Nonnull
    public Optional<Game.Identifier> getCurrentGameOfUser(
            @Nonnull final UUID userId) {
        return delegate.getCurrentGameOfUser(userId);
    }

    @Nonnull
    public Optional<GamePlayers> getGamePlayersAsGameManager(
            @Nonnull final Game.Identifier id) {
        return delegate.getGamePlayersAsGameManager(id);
    }

    @Nonnull
    public Optional<GamePlayers> getGamePlayersAsNonGameManager(
            @Nonnull final Game.Identifier id, @Nonnull final UUID user) {
        return delegate.getGamePlayersAsNonGameManager(id, user);
    }

    @Transactional
    public boolean mayUserJoinGame(@Nonnull final UUID user, @Nonnull final Identifier game) {
        return delegate.mayUserJoinGame(user, game);
    }

    @Transactional
    public void userJoinsGame(@Nonnull final UUID userId,
                              @Nonnull final Game.Identifier gameId)
            throws NoSuchElementException, UserAlreadyPlayingException,
            IllegalGameStateException, SecurityException {
        delegate.userJoinsGame(userId, gameId);
    }

}
