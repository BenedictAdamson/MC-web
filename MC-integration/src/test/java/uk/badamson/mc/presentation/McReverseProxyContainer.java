package uk.badamson.mc.presentation;
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

import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.images.builder.ImageFromDockerfile;

/**
 * <p>
 * A Testcontainers Docker providing an HTTP reverse proxy (ingress) for the MC
 * HTTP servers.
 * </p>
 */
public final class McReverseProxyContainer
         extends GenericContainer<McReverseProxyContainer> {

   public static final int PORT = 80;

   private static final ImageFromDockerfile REAL_BE_IMAGE = createImageWithConfiguration(
           "reverse-proxy.rp.conf"
   );

   private static final ImageFromDockerfile MOCK_BE_IMAGE = createImageWithConfiguration(
           "mock-be.rp.conf"
   );


   private static ImageFromDockerfile createImageWithConfiguration(final String nginxConfigurationResourcePath) {
      return new ImageFromDockerfile()
              .withFileFromClasspath("Dockerfile", "reverse-proxy.Dockerfile")
              .withFileFromClasspath("rp.conf", nginxConfigurationResourcePath);
   }

   public static McReverseProxyContainer createWithRealBe() {
      return new McReverseProxyContainer(REAL_BE_IMAGE);
   }

   public static McReverseProxyContainer createWithMockBe() {
      return new McReverseProxyContainer(MOCK_BE_IMAGE);
   }

   private McReverseProxyContainer(final ImageFromDockerfile image) {
      super(image);
      addExposedPort(PORT);
      waitingFor(Wait.forListeningPort());
   }



}
