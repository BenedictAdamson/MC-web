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

import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.HashSet;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.shaded.com.google.common.collect.Sets;

import com.mongodb.MongoCredential;
import com.mongodb.MongoSecurityException;

/**
 * <p>
 * Basic system test for the MC database, testing it operating alone.
 * </p>
 * <p>
 * The test builds the Docker image using the real Dockerfile, so this also
 * tests that Dockerfile.
 * </p>
 */
@TestMethodOrder(OrderAnnotation.class)
@Testcontainers
@Tag("IT")
public class SolitaryDatabaseIT {

   @Nested
   public class Read {

      @Test
      @Order(2)
      public void root() {
         test(McDatabaseContainer.ROOT_CREDENTIALS, ALL_DBS);
      }

      private void test(final MongoCredential credentials,
               final HashSet<String> expectedDbs) {
         try (final var client = container.createClient(credentials);) {
            final var databaseNames = Sets
                     .newHashSet(client.listDatabaseNames());
            assertEquals(expectedDbs, databaseNames, "databaseNames");
         } // try

         final var logs = container.getLogs();
         assertThatNoErrorMessages(logs);
      }

      @Test
      @Order(2)
      public void user() {
         test(McDatabaseContainer.USER_CREDENTIALS,
                  Sets.newHashSet(McDatabaseContainer.DB));
      }

   }// class

   private static final HashSet<String> ALL_DBS = Sets.newHashSet(
            McDatabaseContainer.DB, McDatabaseContainer.AUTHENTICATION_DB,
            "config", "local");

   @Container
   private final McDatabaseContainer container = new McDatabaseContainer();

   private void assertThatNoErrorMessages(final String logs) {
      assertThat(logs, not(containsString("ERROR")));
   }

   @Test
   @Order(2)
   public void badCredentials() {
      try (final var client = container
               .createClient(McDatabaseContainer.BAD_CREDENTIALS);) {
         /*
          * Read something, so the DBMS checks the credentials. Must construct
          * the HashSet, because the Mongo Iterable does lazy (on-demand) reads.
          */
         Assertions.assertThrows(MongoSecurityException.class,
                  () -> Sets.newHashSet(client.listDatabaseNames()));
      } // try
   }

   @Test
   @Order(1)
   public void start() {
      assertThatNoErrorMessages(container.getLogs());
   }
}
