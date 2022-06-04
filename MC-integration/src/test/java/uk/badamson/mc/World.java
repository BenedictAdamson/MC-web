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

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.opentest4j.AssertionFailedError;
import org.testcontainers.lifecycle.TestDescription;
import org.testcontainers.lifecycle.TestLifecycleAware;
import uk.badamson.mc.McContainers.HttpServer;
import uk.badamson.mc.presentation.HomePage;
import uk.badamson.mc.presentation.Page;

import javax.annotation.Nonnull;
import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.ProtocolException;
import java.net.URI;
import java.nio.file.Path;
import java.time.Instant;
import java.util.*;
import java.util.stream.Stream;

/**
 * <p>
 * Encapsulate access to an instance of MC, for Cucumber (BDD) testing.
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
 * <p>
 * It is tempting to mark the {@link #beginScenario(Scenario)} method with a
 * Cucumber {@link Before} annotation, and the {@link #endScenario(Scenario)}
 * method with a Cucumber {@link After} annotation. However, then the
 * Cucumber-Spring integration would give beans of this class
 * {@code cucumber-glue} scope, and not reuse the bean for multiple tests. As
 * this bean is <em>very</em> expensive to create, that would make testing far
 * too expensive.
 * </p>
 *
 * @see WorldScenarioHook
 */
public final class World implements AutoCloseable, TestLifecycleAware {

   private static Optional<Throwable> createOutcomeException(
            final Scenario scenario) {
      /*
       * Unfortunately, Cucumber does not provide us with the exception that
       * caused a test failure.
       */
      final Throwable throwable;
      if (scenario.isFailed()) {
         throwable = new AssertionError(
                  "Scenario " + scenario.getId() + " failed");
      } else {
         throwable = null;
      }
      return Optional.ofNullable(throwable);
   }

   private static TestDescription createTestDescription(
            final Scenario scenario) {
      return new TestDescription() {

         @Override
         public String getFilesystemFriendlyName() {
            return scenario.getName();
         }

         @Override
         public String getTestId() {
            return scenario.getId();
         }
      };
   }

   static String getPathOfUrl(final String url) {
      return URI.create(url).getPath();
   }

   private static <TYPE> boolean intersects(final Set<TYPE> set1,
            final Set<TYPE> set2) {
      /* The sets intersect if we can find any element in both. */
      return set1.stream().anyMatch(set2::contains);
   }

   private final McContainers containers;

   private int nUsers;

   private User administratorUser;

   private RemoteWebDriver webDriver;

   private URI localUrl;

   private Page expectedPage;

   private User currentUser;

   private boolean loggedIn;

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
      setLoggedIn(false);
   }

   @Override
   public void afterTest(TestDescription description, Optional<Throwable> throwable) {
      containers.afterTest(description, throwable);
      expectedPage = null;// expectedPage holds reference to webDriver
      webDriver = null;
   }

   /**
    * <p>
    * Prepare the SUT and this interface for execution of a Cucumber scenario.
    * </p>
    * <p>
    * This should be called {@link Before} each scenario.
    * </p>
    *
    * @param scenario
    *           The scenario that is beginning.
    * @throws NullPointerException
    *            If {@code scenario} is null;
    */
   public void beginScenario(final Scenario scenario) {
      /*
       * Recreates the web driver, so tests do not share cookies, JavaScript
       * state, etc.
       */
      beforeTest(createTestDescription(scenario));
      /*
       * The previous test might have left us deep in the page hierarchy, so
       * reset to the top location, and must not use the old webDriver.
       */
      getHomePage();
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

   public void joinGame(Game.Identifier game) {
      containers.joinGame(game, currentUser);
   }

   public void startGame(Game.Identifier game) {
      containers.startGame(game);
   }

   private User createUser(final Set<Authority> authorities) {
      final var userDetails = generateBasicUserDetails(authorities);
      final var id = containers.addUser(userDetails);
      return new User(id, userDetails);
   }

   public void currentUserDoesNotHaveRole(final Authority role) {
      Objects.requireNonNull(role, "role");

      final var authorities = EnumSet.complementOf(EnumSet.of(role));
      currentUser = createUser(authorities);
   }

   public void currentUserHasRoles(final Set<Authority> included,
            final Set<Authority> excluded) {
      Objects.requireNonNull(included, "included");
      Objects.requireNonNull(excluded, "excluded");
      if (intersects(included, excluded)) {
         throw new IllegalArgumentException("Contradictory role constraints");
      }

      currentUser = createUser(included);
   }

   public void currentUserIsAdministrator() {
      Objects.requireNonNull(administratorUser, "administratorUser");
      currentUser = administratorUser;
   }

   public void currentUserIsUnknownUser() {
      currentUser = new User(UUID.randomUUID(),
               generateBasicUserDetails(Authority.ALL));
   }

   /**
    * <p>
    * Shutdown the SUT because a scenario has ended, and internally record the
    * outcome of the scenario.
    * </p>
    * <p>
    * This should be called {@link After} each scenario.
    * </p>
    *
    * @param scenario
    *           The scenario that has ended.
    * @throws NullPointerException
    *            If {@code scenario} is null;
    */
   public void endScenario(final Scenario scenario) {
      final var testDescription = createTestDescription(scenario);
      final var exception = createOutcomeException(scenario);
      afterTest(testDescription, exception);// invalidates webDriver
   }

   private BasicUserDetails generateBasicUserDetails(
            final Set<Authority> authorities) {
      final var sequenceId = ++nUsers;
      final var username = "User " + sequenceId;
      final var password = "password" + sequenceId;
      return new BasicUserDetails(username, password, authorities, true, true,
               true, true);
   }

   /**
    * <p>
    * Get the current expected page, which is expected to be of a given class,
    * with failure of that expectation being interpreted as a test failure.
    * </p>
    * <ul>
    * <li>Not null</li>
    * </ul>
    *
    * @param <PAGE>
    *           The class of the expected page.
    * @param clazz
    *           The {@link Class} object of the class of the expected page.
    * @return The current expected page.
    * @throws NullPointerException
    *            If {@code clazz} is null
    * @throws AssertionFailedError
    *            <ul>
    *            <li>If there is no current expected page.</li>
    *            <li>If the class of the current expected page is not the given
    *            {@code clazz} class.</li>
    *            </ul>
    * @see #getExpectedPage(Class)
    */
   @Nonnull
   public <PAGE extends Page> PAGE getAndAssertExpectedPage(
            @Nonnull final Class<PAGE> clazz) {
      try {
         return getExpectedPage(clazz);
      } catch (final IllegalStateException e) {
         throw new AssertionFailedError(
                  "Current expected page is a " + clazz.getTypeName(), e);
      }
   }

   /**
    * <p>
    * The {@linkplain URI#getPath() path} component of the
    * {@linkplain WebDriver#getCurrentUrl() current URL} of the browser.
    * </p>
    * <p>
    * Tests should use value, rather than the current URL of the browser,
    * because the current URL includes the server host-name, which is a test
    * implementation detail.
    * </p>
    *
    * @return the path; not null.
    */
   public String getCurrentUrlPath() {
      return getPathOfUrl(getWebDriver().getCurrentUrl());
   }

   public User getCurrentUser() {
      return currentUser;
   }

   /**
    * <p>
    * Get the current expected page, which is expected to be of a given class.
    * </p>
    * <ul>
    * <li>Not null</li>
    * </ul>
    *
    * @param <PAGE>
    *           The class of the expected page.
    * @param clazz
    *           The {@link Class} object of the class of the expected page.
    * @return The current expected page.
    * @throws NullPointerException
    *            If {@code clazz} is null
    * @throws IllegalStateException
    *            <ul>
    *            <li>If there is no current expected page.</li>
    *            <li>If the class of the current expected page is not the given
    *            {@code clazz} class.</li>
    *            </ul>
    * @see #getAndAssertExpectedPage(Class)
    */
   @Nonnull
   public <PAGE extends Page> PAGE getExpectedPage(
            @Nonnull final Class<PAGE> clazz) {
      Objects.requireNonNull(clazz, "clazz");
      try {
         return clazz.cast(expectedPage);
      } catch (final ClassCastException e) {
         throw new IllegalStateException(
                  "Current expected page is not a " + clazz.getTypeName(), e);
      }
   }

   public Stream<Instant> getGameCreationTimes(final UUID scenario) {
      return containers.getGameCreationTimes(scenario);
   }

   public HomePage getHomePage() {
      final var homePage = new HomePage(getWebDriver());
      homePage.get();
      expectedPage = homePage;
      return homePage;
   }

   /**
    * <p>
    * Perform an HTTP request of the front-end of the SUT, using the previously
    * {@linkplain #setUrlPath(String) set URL}, and return the HTTP status code
    * of the response.
    * </p>
    *
    * @param method
    *           the HTTP method of the request.
    * @throws IllegalArgumentException
    *            If {@code method} is not a valid HTTP method
    * @throws IllegalStateException
    *            <ul>
    *            <li>If the scenario has not
    *            {@linkplain #beginScenario(Scenario) begun}.</li>
    *            <li>If the scenario has {@linkplain #endScenario(Scenario)
    *            ended}.</li>
    *            <li>If the this has been {@linkplain #close() closed}.</li>
    *            <li>If no URL was previously {@linkplain #setUrlPath(String)
    *            set}.</li>
    *            </ul>
    */
   public int getHttpResponseCode(final String method) {
      try {
         Objects.requireNonNull(localUrl, "urlPath not set");
         final var connection = (HttpURLConnection) localUrl.toURL()
                  .openConnection();
         connection.setRequestMethod(method);
         connection.connect();
         return connection.getResponseCode();
      } catch (final ProtocolException e) {
         throw new IllegalArgumentException("Illegal method " + method, e);
      } catch (IOException | NullPointerException e) {
         throw new IllegalStateException(e);
      }
   }

   /**
    * <p>
    * The currently logged-in user.
    * </p>
    * <p>
    * Or null if no user is currently logged-in.</li>
    *
    * @return the user
    */
   public User getLoggedInUser() {
      return loggedIn ? currentUser : null;
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
      try {
         /*
          * @PreDestroy method will not be called if we throw an exception, so
          * must roll back yourself in that case. Important because this
          * allocates expensive resources.
          */
         administratorUser = User
                  .createAdministrator(McContainers.ADMINISTARTOR_PASSWORD);
      } catch (final Exception e) {
         close();
         throw e;
      }
   }

   /**
    * <p>
    * Change the current {@linkplain #getExpectedPage(Class) expected page}
    * </p>
    *
    * @param expectedPage
    *           The new expected page.
    * @throws NullPointerException
    *            If {@code expectedPage} is null
    */
   public void setExpectedPage(@Nonnull final Page expectedPage) {
      this.expectedPage = Objects.requireNonNull(expectedPage, "expectedPage");
   }

   /**
    * <p>
    * Change whether the current user is {@linkplain #getLoggedInUser()
    * logged-in user}.
    * </p>
    *
    * @param loggedIn
    *           Whether the current user is logged in
    */
   public void setLoggedIn(final boolean loggedIn) {
      this.loggedIn = loggedIn;
   }

   /**
    * <p>
    * Indicate that the next web operation on the SUT will be for the URL that
    * has a given path component.
    * </p>
    *
    * @param path
    *           The path component
    * @throws NullPointerException
    *            If {@code path} is null.
    * @throws IllegalArgumentException
    *            If {@code path} violates RFC 2396
    */
   public void setUrlPath(final String path) {
      localUrl = containers.createUriFromPath(HttpServer.INGRESS, path);
   }

}