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

import java.util.Objects;
import java.util.Optional;

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
 * Construction of an instance of this class creates, but does not start, a
 * Docker container for each of the MC servers, plus some DOcker containers for
 * accessing MC using a web browser.
 * </p>
 */
public final class CucumberSutInterface implements AutoCloseable {

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

   private String url;

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
      url = null;
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
   public void endScenario(final Scenario scenario) {
      tellContainersTestOutcome(scenario);
      close();
   }

   /**
    * <p>
    * Perform an HTTP GET of the fron-end of the SUT, using the previously
    * {@linkplain #setPath(String) set URL}.
    * </p>
    *
    * @throws IllegalStateException
    *            <ul>
    *            <li>If the scenario has not
    *            {@linkplain #beginScenario(Scenario) begun}.</li>
    *            <li>If the scenario has {@linkplain #endScenario(Scenario)
    *            ended}.</li>
    *            <li>If the this has been {@linkplain #close() closed}.</li>
    *            <li>If no URL was previously {@linkplain #setPath(String)
    *            set}.</li>
    *            </ul>
    * @throws WebDriverException
    *            If the resource given by the URL does not exist.
    */
   public void get() throws WebDriverException {
      try {
         Objects.requireNonNull(webDriver, "webDriver");
         Objects.requireNonNull(url, "url");
      } catch (final NullPointerException e) {
         throw new IllegalStateException(e);
      }
      webDriver.get(url);
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
   public void setPath(final String path) {
      url = McContainers.createUrlFromPath(path);
   }

   private void tellContainersTestOutcome(final Scenario scenario) {
      final var testDescription = createTestDescription(scenario);
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
      containers.afterTest(testDescription, Optional.ofNullable(throwable));
   }

}// class