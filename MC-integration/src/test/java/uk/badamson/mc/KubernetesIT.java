package uk.badamson.mc;

import java.io.IOException;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/*
 * © Copyright Benedict Adamson 2019.
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

/**
 * <p>
 * System test for MC operating in Kubernetes.
 * </p>
 */
public class KubernetesIT {

   private static final String clusterName = "kind";

   @BeforeAll
   public static void createCluster() throws IOException, InterruptedException {
      final int status = new ProcessBuilder("kind", "create", "cluster",
               "--name", clusterName).start().waitFor();
      if (status != 0) {
         throw new IOException("Cluster creation error status " + status);
      }
   }

   @AfterAll
   public static void deleteCluster() throws IOException, InterruptedException {
      final int status = new ProcessBuilder("kind", "delete", "cluster",
               "--name", clusterName).start().waitFor();
      if (status != 0) {
         throw new IOException("Cluster deletion error status " + status);
      }
   }

   @Test
   public void test() {
      // TODO
   }

}
