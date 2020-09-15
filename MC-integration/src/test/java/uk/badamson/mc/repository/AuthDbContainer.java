package uk.badamson.mc.repository;
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

import org.testcontainers.containers.MariaDBContainer;

import uk.badamson.mc.auth.McAuthContainer;

/**
 * <p>
 * A Testcontainers Docker container holding a database server for use by the
 * (MC-auth) authentication server.
 * </p>
 */
public class AuthDbContainer extends MariaDBContainer<AuthDbContainer> {

   public static final String KEYCLOAK_DB_VENDOR = "mariadb";

   public static final String IMAGE = "mariadb:10";

   private static final String DB_USER = McAuthContainer.DB_USER;
   private static final String DB_NAME = McAuthContainer.DB_NAME;

   public AuthDbContainer(final String password) {
      super(IMAGE);
      withDatabaseName(DB_NAME);
      withUsername(DB_USER);
      withPassword(password);
   }
}
