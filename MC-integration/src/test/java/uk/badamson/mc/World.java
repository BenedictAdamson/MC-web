package uk.badamson.mc;
/*
 * © Copyright Benedict Adamson 2020-22.
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

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.lifecycle.TestDescription;
import org.testcontainers.lifecycle.TestLifecycleAware;
import uk.badamson.mc.presentation.HomePage;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.nio.file.Path;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

/**
 * <p>
 * Encapsulate access to an instance of MC, for BDD testing.
 * </p>
 * <p>
 * Instances of this class are intended to be used as the <i>world</i> used for
 * a BDD test scenario.
 * </p>
 * <p>
 * Construction of an instance of this class creates, but does not start, a
 * Docker container for each of the MC servers, plus some Docker containers for
 * accessing MC using a web browser.
 * </p>
 */
public final class World implements AutoCloseable, TestLifecycleAware {

   private static <TYPE> boolean intersects(final Set<TYPE> set1,
            final Set<TYPE> set2) {
      /* The sets intersect if we can find any element in both. */
      return set1.stream().anyMatch(set2::contains);
   }

   private final McContainers containers;

   private int nUsers;

   private RemoteWebDriver webDriver;

   private User currentUser;

   /**
    * @param failureRecordingDirectory
    *           The location of a directory in which to store files holding
    *           verbose information about failed test cases. Or {@code null} if
    *           no such records are to be made.
    */
   public World(final Path failureRecordingDirectory) {
      containers = new McContainers(failureRecordingDirectory);
   }

   @Override
   public void beforeTest(TestDescription description) {
      containers.beforeTest(description);
      webDriver = containers.getWebDriver();
      currentUser = null;
   }

   @Override
   public void afterTest(TestDescription description, Optional<Throwable> throwable) {
      containers.afterTest(description, throwable);
      webDriver = null;
   }

   /**
    * <p>
    * Stop and then dispose of the Docker containers used for the SUT.
    * </p>
    *
    * @see #open()
    */
   @Override
   @PreDestroy
   public void close() {
      webDriver = null;
      containers.stop();
      containers.close();
   }

   public Game.Identifier createGame(final UUID scenario) {
      return containers.createGame(scenario);
   }

   private User createUser(final Set<Authority> authorities) {
      final var userDetails = generateBasicUserDetails(authorities);
      final var id = containers.addUser(userDetails);
      return new User(id, userDetails);
   }

   public User currentUserHasRoles(final Set<Authority> included,
            final Set<Authority> excluded) {
      Objects.requireNonNull(included, "included");
      Objects.requireNonNull(excluded, "excluded");
      if (intersects(included, excluded)) {
         throw new IllegalArgumentException("Contradictory role constraints");
      }

      currentUser = createUser(included);
      return currentUser;
   }

   public User currentUserIsUnknownUser() {
      currentUser = new User(UUID.randomUUID(),
               generateBasicUserDetails(Authority.ALL));
      return currentUser;
   }

   private BasicUserDetails generateBasicUserDetails(
            final Set<Authority> authorities) {
      final var sequenceId = ++nUsers;
      final var username = "User " + sequenceId;
      final var password = "password" + sequenceId;
      return new BasicUserDetails(username, password, authorities, true, true,
               true, true);
   }

   public HomePage getHomePage() {
      final var homePage = new HomePage(getWebDriver());
      homePage.get();
      return homePage;
   }

   public Stream<NamedUUID> getScenarios() {
      return containers.getScenarios();
   }

   public WebDriver getWebDriver() {
      Objects.requireNonNull(webDriver, "webDriver");
      return webDriver;
   }

   /**
    * @see #close()
    */
   @PostConstruct
   public void open() {
      containers.start();
   }

}