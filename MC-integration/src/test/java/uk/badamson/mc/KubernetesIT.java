package uk.badamson.mc;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;

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

   private static String kubeConfigPath;

   private static void createCluster()
            throws IOException, InterruptedException {
      final int status = new ProcessBuilder("kind", "create", "cluster",
               "--name", clusterName).start().waitFor();
      if (status != 0) {
         throw new IOException("Cluster creation error status " + status);
      }
   }

   private static void initHelm() throws IOException, InterruptedException {
      final int status = new ProcessBuilder("helm", "init", "--kube-context",
               kubeConfigPath).start().waitFor();
      if (status != 0) {
         throw new IOException("Helm initialisation error status " + status);
      }
   }

   private static void setKubeConfigPath()
            throws IOException, InterruptedException {
      final var process = new ProcessBuilder("kind", "get", "kubeconfig-path",
               "--name", clusterName).start();
      final StringWriter writer = new StringWriter();
      try (final Reader reader = new InputStreamReader(process.getInputStream(),
               StandardCharsets.UTF_8)) {
         reader.transferTo(writer);
      }
      ;
      final int status = process.waitFor();
      if (status != 0) {
         throw new IOException("Cluster config query status " + status);
      }
      kubeConfigPath = writer.toString();
   }

   @BeforeAll
   public static void setUp() throws IOException, InterruptedException {
      createCluster();
      setKubeConfigPath();
      initHelm();
   }

   @AfterAll
   public static void tearDown() throws IOException, InterruptedException {
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
