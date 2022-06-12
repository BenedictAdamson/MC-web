package uk.badamson.mc.repository;
/*
 * © Copyright Benedict Adamson 2022.
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

import uk.badamson.mc.User;

import javax.annotation.Nonnull;
import javax.annotation.OverridingMethodsMustInvokeSuper;
import java.util.Optional;
import java.util.UUID;

public final class UserRepositoryAdapter extends RepositoryAdapter<UUID, User> implements UserRepository {

    public UserRepositoryAdapter(@Nonnull UserSpringRepository springRepository) {
        super(springRepository);
    }

    @Nonnull
    @Override
    public Optional<User> findByUsername(@Nonnull String username) {
        return getSpringRepository().findByUsername(username);
    }


    @OverridingMethodsMustInvokeSuper
    @Nonnull
    protected UserSpringRepository getSpringRepository() {
        return (UserSpringRepository) super.getSpringRepository();
    }
}
