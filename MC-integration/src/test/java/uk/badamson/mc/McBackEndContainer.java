package uk.badamson.mc;
/*
 * © Copyright Benedict Adamson 2019-23.
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

import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.containers.wait.strategy.WaitAllStrategy;
import org.testcontainers.containers.wait.strategy.WaitStrategy;
import org.testcontainers.utility.DockerImageName;

import javax.annotation.Nonnull;
import java.time.Duration;
import java.util.Objects;

/**
 * <p>
 * A Testcontainers Docker container for the MC-back-end.
 * </p>
 */
final class McBackEndContainer extends GenericContainer<McBackEndContainer> {

    private static final int PORT = 8080;

    private static final String VERSION = SutVersions.MC_BACK_END_VERSION;

    private static final DockerImageName IMAGE = DockerImageName
            .parse("index.docker.io/benedictadamson/mc-back-end:" + VERSION);

    private static final String STARTED_MESSAGE = "Started Application";

    private static final WaitStrategy WAIT_STRATEGY = new WaitAllStrategy()
            .withStartupTimeout(Duration.ofSeconds(20))
            .withStrategy(Wait.forLogMessage(".*" + STARTED_MESSAGE + ".*", 1));

    @Nonnull
    private final String mongoDbHost;
    @Nonnull
    private final String mongoDbPassword;
    @Nonnull
    private final String administratorPassword;

    @SuppressWarnings("resource")
    McBackEndContainer(
            @Nonnull final String mongoDbHost,
            @Nonnull final String mongoDbPassword,
            @Nonnull final String administratorPassword
    ) {
        super(IMAGE);
        this.mongoDbHost = Objects.requireNonNull(mongoDbHost);
        this.mongoDbPassword = Objects.requireNonNull(mongoDbPassword);
        this.administratorPassword = Objects.requireNonNull(administratorPassword);
        waitingFor(WAIT_STRATEGY);
        withEnv("SPRING_DATA_MONGODB_PASSWORD", mongoDbPassword);
        withEnv("ADMINISTRATOR_PASSWORD", administratorPassword);
        withCommand("--spring.data.mongodb.host=" + mongoDbHost);
        addExposedPort(PORT);
    }

    @Nonnull
    McBackEndClient createClient() {
        return new McBackEndClient(getHost(), getMappedPort(PORT), administratorPassword);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        McBackEndContainer that = (McBackEndContainer) o;

        return mongoDbHost.equals(that.mongoDbHost) &&
                mongoDbPassword.equals(that.mongoDbPassword) &&
                administratorPassword.equals(that.administratorPassword);
    }

    @Override
    public int hashCode() {
        int result = mongoDbHost.hashCode();
        result = 31 * result + mongoDbPassword.hashCode();
        result = 31 * result + administratorPassword.hashCode();
        return result;
    }

}
