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

import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.jupiter.api.Assertions.assertAll;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.output.WaitingConsumer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * <p>
 * Basic system test for the MC front-end, testing it operating alone without
 * any needed servers.
 * </p>
 * <p>
 * The test builds the Docker image using the real Dockerfile, so this tests
 * that Dockerfile.
 * </p>
 */
@Testcontainers
@Tag("IT")
public class SolitaryFrontEndIT {

   public static final String EXPECTED_STARTED_MESSAGE = "AH00094: Command line";

   @Container
   private final McFrontEndContainer container = new McFrontEndContainer();

   @Test
   public void start() {
      final var consumer = new WaitingConsumer();
      container.followOutput(consumer);
      try {
         consumer.waitUntil(
                  frame -> frame.getUtf8String()
                           .contains(EXPECTED_STARTED_MESSAGE),
                  7000, TimeUnit.MILLISECONDS);
      } catch (final TimeoutException e) {
         // Fall through to the assertion check (which will fail)
      }

      final var logs = container.getLogs();
      assertAll("Log suitable messages",
               () -> assertThat(logs, containsString(EXPECTED_STARTED_MESSAGE)),
               () -> assertThat(logs, not(containsString("error"))));
   }
}
