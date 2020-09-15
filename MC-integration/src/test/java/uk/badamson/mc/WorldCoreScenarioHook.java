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

import org.springframework.beans.factory.annotation.Autowired;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;

/**
 * <p>
 * Enable automatic reporting of the beginning and ending of Cucumber scenarios
 * to a {@link WorldCore} bean.
 * </p>
 */
public final class WorldCoreScenarioHook {
   private final WorldCore worldCore;

   @Autowired
   public WorldCoreScenarioHook(final WorldCore worldCore) {
      this.worldCore = worldCore;
   }

   @Before
   public void beginScenario(final Scenario scenario) {
      worldCore.beginScenario(scenario);
   }

   @After
   public void endScenario(final Scenario scenario) {
      worldCore.endScenario(scenario);
   }

}
