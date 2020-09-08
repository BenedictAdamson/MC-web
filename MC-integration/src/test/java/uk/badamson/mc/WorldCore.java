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
import java.util.Objects;
import java.util.Optional;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.lifecycle.TestDescription;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;

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

   private final McContainers containers = new McContainers();

   private RemoteWebDriver webDriver;

   private URI privateNetworkUrl;

   private URI localUrl;

   /**
    * <p>
    * Prepare the SUT and this interface for execution of a Cucumber scenario.
    * </p>
    * <p>
    * Starts the Docker containers for the SUT. This should be called
    * {@link Before} each scenario.
    * </p>
    *
    * @param scenario
    *           The scenario that is beginning.
    * @throws NullPointerException
    *            If {@code scenario} is null;
    */
   @Before
   public void beginScenario(final Scenario scenario) {
      containers.start();
      containers.beforeTest(createTestDescription(scenario));
      webDriver = containers.getWebDriver();
   }

   /**
    * <p>
    * Stop and then dispose of the Docker containers used for the SUT.
    * </p>
    */
   @Override
   public void close() {
      if (webDriver != null) {
         webDriver.quit();
         webDriver = null;
      }
      privateNetworkUrl = null;
      containers.stop();
      containers.close();
   }

   /**
    * <p>
    * Shutdown the SUT because a scenario has ended, and internally record the
    * outcome of the scenario.
    * </p>
    * <p>
    * This method also {@linkplain #close() closes} this interface. This should
    * be called {@link After} each scenario.
    * </p>
    *
    * @param scenario
    *           The scenario that has ended.
    * @throws NullPointerException
    *            If {@code scenario} is null;
    */
   @After
   public void endScenario(final Scenario scenario) {
      tellContainersTestOutcome(scenario);
      close();
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
      localUrl = containers.createIngressUriFromPath(path);
   }

   private void tellContainersTestOutcome(final Scenario scenario) {
      final var testDescription = createTestDescription(scenario);
      final var exception = createOutcomeException(scenario);
      containers.afterTest(testDescription, exception);
   }

}// class