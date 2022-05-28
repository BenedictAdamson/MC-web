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

import java.time.Duration;
import java.util.Arrays;

import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.containers.wait.strategy.WaitAllStrategy;
import org.testcontainers.containers.wait.strategy.WaitStrategy;
import org.testcontainers.utility.DockerImageName;

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

   public static final DockerImageName IMAGE = DockerImageName
            .parse("index.docker.io/benedictadamson/mc-database:" + VERSION);

   public static final int PORT = 27017;

   public static final String AUTHENTICATION_DB = "admin";

   public static final String DB = "mc";

   private static final String NORMAL_USER = "mc";

   private static final String ROOT_USER = "admin";

   public static final MongoCredential BAD_CREDENTIALS = MongoCredential
            .createCredential("BAD", AUTHENTICATION_DB, "BAD".toCharArray());

   private static final Duration STARTUP_TIME = Duration.ofSeconds(45);

   private static final WaitStrategy WAIT_STRATEGY = new WaitAllStrategy()
            .withStrategy(Wait.forListeningPort())
            .withStartupTimeout(STARTUP_TIME);

   public final MongoCredential userCredentials;

   public final MongoCredential rootCredentials;

   public McDatabaseContainer(final String rootPassword,
            final String userPassword) {
      super(IMAGE);
      userCredentials = MongoCredential.createCredential(NORMAL_USER,
               AUTHENTICATION_DB, userPassword.toCharArray());
      rootCredentials = MongoCredential.createCredential(ROOT_USER,
               AUTHENTICATION_DB, rootPassword.toCharArray());
      addExposedPort(PORT);
      withEnv("MONGO_INITDB_ROOT_PASSWORD", rootPassword);
      withEnv("MC_INIT_PASSWORD", userPassword);
      withCommand("--bind_ip", "0.0.0.0");
      waitingFor(WAIT_STRATEGY);
      addExposedPort(PORT);
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
