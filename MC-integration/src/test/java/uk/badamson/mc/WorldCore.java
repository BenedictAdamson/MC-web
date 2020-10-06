package uk.badamson.mc;
/*
 * © Copyright Benedict Adamson 2020.
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

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.ProtocolException;
import java.net.URI;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicReference;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testcontainers.lifecycle.TestDescription;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;
import uk.badamson.mc.McContainers.HttpServer;

/**
 * <p>
 * Encapsulate access to an instance of MC, for Cucumber (BDD) testing.
 * </p>
 * <p>
 * Instances of this class are intended to be used as the lowest-level (core
 * part) of the <i>world</i> used for a BDD test scenario.
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
 * @see WorldCoreScenarioHook
 */
public final class WorldCore implements AutoCloseable {

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

   private final McContainers containers;

   private final Map<String, User> users = new HashMap<>();

   private final Map<String, User> unknownUsers = new HashMap<>();

   private RemoteWebDriver webDriver;

   private URI privateNetworkUrl;

   private URI localUrl;

   /**
    * @param failureRecordingDirectory
    *           The location of a directory in which to store files holding
    *           verbose information about failed test cases. Or {@code null} if
    *           no such records are to be made.
    */
   public WorldCore(final Path failureRecordingDirectory) {
      containers = new McContainers(failureRecordingDirectory);
   }

   private void addUnknownUser(final User user) {
      unknownUsers.put(user.getUsername(), user);
   }

   private void addUser(final User user) {
      containers.addUser(user);// records the user in the DB, through the BE
      users.put(user.getUsername(), user);

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
      try {
         Objects.requireNonNull(webDriver, "webDriver");
      } catch (final Exception e) {
         throw new IllegalStateException("Not start()-ed", e);
      }
      containers.beforeTest(createTestDescription(scenario));
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
      if (webDriver != null) {
         webDriver.quit();
         webDriver = null;
      }
      privateNetworkUrl = null;
      containers.stop();
      containers.close();
   }

   private void createUsers() {
      addUser(new User("jeff", "password1", Authority.ALL, true, true, true,
               true));
      addUser(new User("allan", "password2", Set.of(Authority.ROLE_PLAYER),
               true, true, true, true));
      addUnknownUser(new User("mark", "password3", Authority.ALL, true, true,
               true, true));
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
      tellContainersTestOutcome(scenario);
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
      return getPathOfUrl(webDriver.getCurrentUrl());
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

   public User getUnknownUser() {
      return users.values().stream().findAny().get();
   }

   /**
    * <p>
    * Perform an HTTP GET of the front-end of the SUT, using the previously
    * {@linkplain #setUrlPath(String) set URL}, using {@link WebDriver} to give
    * a similar experience to manually using a web browser.
    * </p>
    *
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
    * @throws WebDriverException
    *            If the resource given by the URL does not exist.
    */
   public void getUrlUsingBrowser() throws WebDriverException {
      try {
         Objects.requireNonNull(webDriver, "webDriver");
         Objects.requireNonNull(privateNetworkUrl, "url");
      } catch (final NullPointerException e) {
         throw new IllegalStateException(e);
      }
      webDriver.get(privateNetworkUrl.toASCIIString());
   }

   public User getUserWithoutRole(final Authority role) {
      Objects.requireNonNull(role, "role");
      return users.values().stream()
               .filter(user -> !user.getAuthorities().contains(role)).findAny()
               .get();
   }

   public User getUserWithRole(final Authority role) {
      Objects.requireNonNull(role, "role");
      return users.values().stream()
               .filter(user -> user.getAuthorities().contains(role)).findAny()
               .get();
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
          * must roll-back ourself in that case. Important because this
          * allocates expensive resources.
          */
         webDriver = containers.getWebDriver();
         createUsers();
      } catch (Exception e) {
         close();
         throw e;
      }
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
      privateNetworkUrl = McContainers
               .createIngressPrivateNetworkUriFromPath(path);
      localUrl = containers.createUriFromPath(HttpServer.INGRESS, path);
   }

   private void tellContainersTestOutcome(final Scenario scenario) {
      final var testDescription = createTestDescription(scenario);
      final var exception = createOutcomeException(scenario);
      containers.afterTest(testDescription, exception);
   }

   /**
    * <p>
    * Wait until the {@linkplain #getCurrentUrlPath() path component of the
    * current URL of the browser} becomes equal to a given path, of a timeout
    * expires.
    * </p>
    *
    * @param timeout
    *           The maximum time, in seconds, to wait for the path of the
    *           browser to become equal to the given {@code path}.
    * @param path
    *           The wanted path
    * @throws TimeoutException
    *            If the browser path does not become equal to the given
    *            {@code path} within the given {@code timeout}.
    */
   public void waitUntilCurrentUrlPath(final long timeout, final String path)
            throws TimeoutException {
      final var current = new AtomicReference<String>();
      try {
         new WebDriverWait(webDriver, timeout).until(driver -> {
            final var p = getPathOfUrl(driver.getCurrentUrl());
            current.set(p);
            return p.equals(path);
         });
      } catch (final org.openqa.selenium.TimeoutException e) {
         throw new TimeoutException("Timeout while waiting URL path (currently "
                  + current.get() + ") to become " + path);
      }
   }

}// class