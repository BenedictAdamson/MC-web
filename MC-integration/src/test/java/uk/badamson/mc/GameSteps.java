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

import javax.annotation.Nonnull;

import org.springframework.beans.factory.annotation.Autowired;

import io.cucumber.java.en.When;
import uk.badamson.mc.presentation.ScenarioPage;

/**
 * <p>
 * Definitions of BDD steps, for features about games.
 * </p>
 */
public class GameSteps extends Steps {

   private int scenarioIndex;

   private int gameIndex;

   private Game.Identifier identifier;

   @Autowired
   public GameSteps(@Nonnull final WorldCore worldCore) {
      super(worldCore);
   }

   @When("Navigate to one game of the scenario")
   public void navigate_to_game_of_scenario() {
      final var scenarioPage = (ScenarioPage) expectedPage;
      gameIndex = 0;
      expectedPage = scenarioPage.navigateToGamePage(gameIndex);
   }

   private void navigateToScenario() {
      final var scenariosPage = getHomePage().navigateToScenariosPage();
      expectedPage = scenariosPage.navigateToScenario(scenarioIndex);
   }

   @When("A scenario has games")
   public void scenario_has_games() {
      final var scenario = worldCore.getScenarios().findFirst().get().getId();
      scenarioIndex = 0;
      identifier = worldCore.createGame(scenario);
   }

   @When("Viewing the games of the scenario")
   public void viewing_games_of_scenario() {
      navigateToScenario();
      expectedPage.requireIsCurrentPath();
   }
}
