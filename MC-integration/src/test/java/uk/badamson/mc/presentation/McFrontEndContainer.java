package uk.badamson.mc.presentation;
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
import org.testcontainers.utility.DockerImageName;
import uk.badamson.mc.SutVersions;

public final class McFrontEndContainer
        extends GenericContainer<McFrontEndContainer> {

    private static final String VERSION = SutVersions.MC_WEB_VERSION;

    private static final int PORT = 80;

    private static final DockerImageName IMAGE = DockerImageName.parse(
            "index.docker.io/benedictadamson/mc-front-end-srv:" + VERSION);

    public McFrontEndContainer() {
        super(IMAGE);
        addExposedPort(PORT);
        waitingFor(Wait.forListeningPort());
    }

}
