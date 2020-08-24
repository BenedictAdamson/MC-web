package uk.badamson.mc.auth;
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

/**
 * <p>
 * A Testcontainers Docker container holding a database server for use by the
 * (MC-auth) authentication server.
 * </p>
 */
public class AuthDbContainer extends MariaDBContainer<AuthDbContainer> {

   public static final String HOST = "auth-db";

   public AuthDbContainer() {
      withNetworkAliases(HOST);
      withDatabaseName(McAuthContainer.DB_NAME);
      withUsername(McAuthContainer.DB_USER);
      withPassword(McAuthContainer.DB_PASSWORD);
   }
}
