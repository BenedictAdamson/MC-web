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
import java.util.WeakHashMap;

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
 * Instances of this class encapsulate a Docker container for each of the MC
 * servers, plus some Docker containers for accessing MC using a web browser.
 * </p>
 */
public final class WorldCore implements AutoCloseable {

   private enum State {

      CREATED {

         @Override
         void beginScenario(final WorldCore world, final Scenario scenario) {
            world.doBeginScenario(scenario);
         }

         @Override
         void endScenario(final WorldCore world, final Scenario scenario) {
            throw new IllegalStateException(toString());
         }
      },
      BEGUN {
         @Override
         void beginScenario(final WorldCore world, final Scenario scenario) {
            /*
             * Do nothing, so may be called in quick succession from multiple
             * upper layers during the start up of a scenario
             */
         }

         @Override
         void endScenario(final WorldCore world, final Scenario scenario) {
            world.doEndScenario(scenario);
         }
      },
      ENDED {
         @Override
         void beginScenario(final WorldCore world, final Scenario scenario) {
            throw new IllegalStateException(toString());
         }

         @Override
         void endScenario(final WorldCore world, final Scenario scenario) {
            /*
             * Do nothing, so may be called in quick succession from multiple
             * upper layers during the shut down of a scenario
             */
         }
      },
      CLOSED {
         @Override
         void beginScenario(final WorldCore world, final Scenario scenario) {
            throw new IllegalStateException(toString());
         }

         @Override
         void close(final WorldCore world) {
            // Do nothing (already closed): idempotent
         }

         @Override
         void endScenario(final WorldCore world, final Scenario scenario) {
            /*
             * Do nothing, so close and endScenario may be called in quick
             * succession from multiple upper layers during the shut down of a
             * scenario
             */
         }
      };

      abstract void beginScenario(WorldCore world, Scenario scenario);

      void close(final WorldCore world) {
         world.doClose();
      }

      abstract void endScenario(WorldCore world, Scenario scenario);
   }// enum

   private static WeakHashMap<String, WorldCore> instances = new WeakHashMap<>();

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

   /**
    * <p>
    * Create or acquire an instance of the {@link WorldCore} for use while
    * running a given Cucumber scenario.
    * </p>
    * <p>
    * All the step definitions should, directly or indirectly, use an instance
    * created by this method. In practice, this means that step definition
    * classes should have a {@link Before} method that delegates to this method
    * and records the returned reference.
    *
    * @param scenario
    *           The scenario for which an instance is wanted.
    * @return The instance for the given scenario.
    * @throws NullPointerException
    *            If {@code scenario} is null
    */
   public static WorldCore getInstance(final Scenario scenario) {
      Objects.requireNonNull(scenario, "scenario");
      final var key = scenario.getId();
      WorldCore instance;
      synchronized (instances) {
         instance = instances.get(key);
         if (instance == null) {
            instance = new WorldCore();
            instances.put(key, instance);
         }
      }
      return instance;
   }

   private final McContainers containers = new McContainers();

   private RemoteWebDriver webDriver;

   private String url;

   private State state = State.CREATED;

   private WorldCore() {
      // Constructor is provate to firce use of getInstance.
   }

   /**
    * <p>
    * Prepare the SUT and this interface for execution of a Cucumber scenario.
    * </p>
    * <p>
    * Starts the Docker containers for the SUT. This should be called
    * {@link Before} each scenario. It is safe for this method to be called
    * multiple times at the beginning of a scenario. To ensure that this is
    * called for each scenario, all step definition classes should have a
    * {@link Before} method that delegates to this method.
    * </p>
    *
    * @param scenario
    *           The scenario that is beginning.
    * @throws NullPointerException
    *            If {@code scenario} is null;
    */
   public void beginScenario(final Scenario scenario) {
      state.beginScenario(this, scenario);
   }

   /**
    * <p>
    * Stop and then dispose of the Docker containers used for the SUT.
    * </p>
    */
   @Override
   public void close() {
      state.close(this);
   }

   private void doBeginScenario(final Scenario scenario) {
      if (state != State.CREATED) {
         throw new IllegalStateException(state.toString());
      }
      containers.start();
      containers.beforeTest(createTestDescription(scenario));
      webDriver = containers.getWebDriver();
      state = State.BEGUN;
   }

   private void doClose() {
      if (webDriver != null) {
         webDriver.quit();
         webDriver = null;
      }
      url = null;
      containers.stop();
      containers.close();
      state = State.CLOSED;
   }

   private void doEndScenario(final Scenario scenario) {
      if (state != State.BEGUN) {
         throw new IllegalStateException(state.toString());
      }
      tellContainersTestOutcome(scenario);
      state = State.ENDED;
      close();
   }

   /**
    * <p>
    * Shutdown the SUT because a scenario has ended, and internally record the
    * outcome of the scenario.
    * </p>
    * <p>
    * This method also {@linkplain #close() closes} this interface. This should
    * be called {@link After} each scenario. It is safe for this method to be
    * called multiple times at the end of a scenario. To ensure that this is
    * called for each scenario, all step definition classes should have an
    * {@link After} method that delegates to this method.
    * </p>
    *
    * @param scenario
    *           The scenario that has ended.
    * @throws NullPointerException
    *            If {@code scenario} is null;
    */
   public void endScenario(final Scenario scenario) {
      doEndScenario(scenario);
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