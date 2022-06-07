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

import com.mongodb.MongoCredential;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.containers.wait.strategy.WaitAllStrategy;
import org.testcontainers.containers.wait.strategy.WaitStrategy;
import org.testcontainers.utility.DockerImageName;
import uk.badamson.mc.Version;

import java.time.Duration;

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

    private static final String NORMAL_USER = "mc";

    private static final String ROOT_USER = "admin";

    private static final Duration STARTUP_TIME = Duration.ofSeconds(45);

    private static final WaitStrategy WAIT_STRATEGY = new WaitAllStrategy()
            .withStrategy(Wait.forListeningPort())
            .withStartupTimeout(STARTUP_TIME);

    public final MongoCredential userCredentials;

    public final MongoCredential rootCredentials;

    @SuppressWarnings("resource")
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

}
