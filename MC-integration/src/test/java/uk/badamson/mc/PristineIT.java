package uk.badamson.mc;
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

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.ProtocolException;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * <p>
 * Basic system test for the MC components operating together, testing it
 * operating as a pristine (fresh) installation.
 * </p>
 * <p>
 * These tests demonstrate that it is possible to configure the components to
 * communicate correctly with each other. They do not really demonstrate
 * specific correct functionality.
 * </p>
 */
@TestMethodOrder(OrderAnnotation.class)
@Testcontainers
@Tag("IT")
public class PristineIT implements AutoCloseable {

   /**
    * All the tests are read-only, so we do not need to recreate the containers
    * for each test. This is a big win, because creating all the containers is
    * very expensive.
    */
   private static final McContainers containers = new McContainers();

   @BeforeAll
   public static void open() {
      containers.start();
   }

   @AfterAll
   public static void stop() {
      containers.stop();
   }

   private void assertGetHttpStatus(final String path,
            final int expectedStatus) {
      assertThat("HTTP status", getHttpResponseCode("GET", ""),
               is(expectedStatus));
   }

   @Override
   public void close() {
      stop();
   }

   @Test
   @Order(2)
   public void getAuthRootPage() {
      assertGetHttpStatus("/auth", HttpURLConnection.HTTP_SEE_OTHER);
   }

   @Test
   @Order(3)
   public void getAuthWellKnownName() {
      assertGetHttpStatus(
               "/auth/realms/master/.well-known/openid-configuration",
               HttpURLConnection.HTTP_OK);
      /*
       * Should show a JSON document listing a number of endpoints for Keycloak.
       */
   }

   @Test
   @Order(2)
   public void getHomePage() {
      assertGetHttpStatus("", HttpURLConnection.HTTP_OK);
   }

   private int getHttpResponseCode(final String method, final String path) {
      try {
         final var localUrl = containers.createIngressUriFromPath(path);
         final HttpURLConnection connection = (HttpURLConnection) localUrl
                  .toURL().openConnection();
         connection.setRequestMethod(method);
         connection.connect();
         return connection.getResponseCode();
      } catch (final ProtocolException e) {
         throw new IllegalArgumentException("Illegal method " + method, e);
      } catch (IOException | NullPointerException e) {
         throw new IllegalStateException(e);
      }
   }

   @Test
   @Order(1)
   public void start() {
      containers.assertThatNoErrorMessagesLogged();
   }
}
