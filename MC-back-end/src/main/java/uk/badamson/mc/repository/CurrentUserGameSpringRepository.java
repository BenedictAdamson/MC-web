package uk.badamson.mc.repository;
/*
 * © Copyright Benedict Adamson 2020,22.
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

import org.springframework.data.repository.CrudRepository;
import uk.badamson.mc.Game;

import java.util.UUID;

/**
 * <p>
 * Interface for generic CRUD operations on a repository for recording which
 * {@linkplain Game game} (if any) is the <i>current game</i> of each user.
 * </p>
 */
public interface CurrentUserGameSpringRepository
        extends CrudRepository<UserGameAssociationDTO, UUID> {

}
