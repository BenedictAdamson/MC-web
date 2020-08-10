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

import java.time.Duration;
import java.util.Arrays;

import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.containers.wait.strategy.WaitAllStrategy;
import org.testcontainers.containers.wait.strategy.WaitStrategy;

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

   private static final String NORMAL_USER = "mc";

   private static final String ROOT_USER = "admin";

   private static final String ROOT_PASSWORD = "letmein";

   private static final String USER_PASSWORD = "password123";

   public static final MongoCredential USER_CREDENTIALS = MongoCredential
            .createCredential(NORMAL_USER, AUTHENTICATION_DB,
                     USER_PASSWORD.toCharArray());

   public static final MongoCredential ROOT_CREDENTIALS = MongoCredential
            .createCredential(ROOT_USER, AUTHENTICATION_DB,
                     ROOT_PASSWORD.toCharArray());

   public static final MongoCredential BAD_CREDENTIALS = MongoCredential
            .createCredential("BAD", AUTHENTICATION_DB, "BAD".toCharArray());

   private static final Duration STARTUP_TIME = Duration.ofMillis(100);

   private static final WaitStrategy WAIT_STRATEGY = new WaitAllStrategy()
            .withStrategy(Wait.forLogMessage(".*MongoDB starting.*", 1))
            .withStrategy(Wait.forListeningPort())
            .withStrategy(Wait.forLogMessage(
                     ".*[Ii]nitiali[sz]ation of mc db complete.*", 1))
            .withStrategy(Wait.forLogMessage(".*init process complete.*", 1))
            .withStrategy(
                     Wait.forLogMessage(".*[Ww]aiting for connection.*", 1));

   public McDatabaseContainer() {
      super(IMAGE);
      addExposedPort(PORT);
      withEnv("MONGO_INITDB_ROOT_PASSWORD", ROOT_PASSWORD);
      withEnv("MC_INIT_PASSWORD", USER_PASSWORD);
      withCommand("--bind_ip", "0.0.0.0");
      withNetworkAliases(HOST);
      withMinimumRunningDuration(STARTUP_TIME);
      waitingFor(WAIT_STRATEGY);
   }

   public MongoClient createClient(final MongoCredential credentials) {
      return MongoClients.create(MongoClientSettings.builder()
               .applyToClusterSettings(builder -> builder
                        .hosts(Arrays.asList(getServerAddress())))
               .credential(credentials).build());
   }

   private ServerAddress getServerAddress() {
      return new ServerAddress(getHost(), getMappedPort(PORT));
   }
}
