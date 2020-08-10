package uk.badamson.mc.repository;
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

import java.util.Arrays;

import org.testcontainers.containers.GenericContainer;

import com.mongodb.MongoClientSettings;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

import uk.badamson.mc.Version;

/**
 * <p>
 * A Testcontainers Docker container for the MC-database.
 * </p>
 */
public final class McDatabaseContainer
         extends GenericContainer<McDatabaseContainer> {

   public static final String VERSION = Version.VERSION;

   public static final String IMAGE = "index.docker.io/benedictadamson/mc-database:"
            + VERSION;

   public static final int PORT = 27017;

   public static final String HOST = "db";

   public static final String AUTHENTICATION_DB = "admin";

   public static final String DB = "mc";

   public static final String USER_NAME = "mc";

   public static final String PASSWORD = "letmein";

   public static final MongoCredential CREDENTIALS = MongoCredential
            .createCredential(USER_NAME, DB, PASSWORD.toCharArray());

   public McDatabaseContainer() {
      super(IMAGE);
      withNetworkAliases(HOST);
      withEnv("MONGO_INITDB_ROOT_PASSWORD", PASSWORD);
      withCommand("--bind_ip", "0.0.0.0");
      addExposedPort(PORT);
   }

   public MongoClient createClient(final MongoCredential credentials) {
      return MongoClients.create(MongoClientSettings.builder()
               .applyToClusterSettings(builder -> builder
                        .hosts(Arrays.asList(getServerAddress())))
               .credential(credentials).build());
   }

   private ServerAddress getServerAddress() {
      return new ServerAddress(getHost(), this.getMappedPort(PORT));
   }
}
