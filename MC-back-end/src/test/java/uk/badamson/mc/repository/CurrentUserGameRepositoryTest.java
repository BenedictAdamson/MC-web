package uk.badamson.mc.repository;
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

import uk.badamson.dbc.assertions.ObjectVerifier;

import java.util.UUID;

/**
 * <p>
 * Auxiliary test code for classes that implement the
 * {@link CurrentUserGameSpringRepository} interface.
 */
public class CurrentUserGameRepositoryTest {

    public static void assertInvariants(
            final CurrentUserGameSpringRepository repository) {
        ObjectVerifier.assertInvariants(repository);// inherited
        CrudRepositoryTest.assertInvariants(repository);// inherited
    }

    public static final class Fake
            extends CrudRepositoryTest.AbstractFake<UserGameAssociationDTO, UUID>
            implements CurrentUserGameSpringRepository {

        @Override
        protected UserGameAssociationDTO copy(
                final UserGameAssociationDTO association) {
            return association;// no need to copy, as is immutable
        }

        @Override
        protected UUID getId(final UserGameAssociationDTO game) {
            return game.user();
        }

    }

}
