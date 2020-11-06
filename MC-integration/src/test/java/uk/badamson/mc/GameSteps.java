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

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import uk.badamson.mc.presentation.GamePage;
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
   public GameSteps(@Nonnull final World world) {
      super(world);
   }

   @Then("The game page includes the scenario description")
   public void game_page_includes_scenario_description() {
      // hard to test
   }

   @Then("The game page includes the scenario title")
   public void game_page_includes_scenario_title() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIncludesScenarioTitle();
   }

   @Then("The game page includes the date and time that the game was set up")
   public void game_page_includes_time_set_up() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIncludesCreationTime();
   }

   @Then("MC serves the game page")
   public void mc_serves_game_page() {
      world.getAndAssertExpectedPage(GamePage.class).assertInvariants();
   }

   @When("Navigate to one game of the scenario")
   public void navigate_to_game_of_scenario() {
      final var scenarioPage = world.getExpectedPage(ScenarioPage.class);
      gameIndex = 0;
      world.setExpectedPage(scenarioPage.navigateToGamePage(gameIndex));
   }

   private void navigateToScenario() {
      final var scenariosPage = world.getHomePage().navigateToScenariosPage();
      world.setExpectedPage(scenariosPage.navigateToScenario(scenarioIndex));
   }

   @When("A scenario has games")
   public void scenario_has_games() {
      final var scenario = world.getScenarios().findFirst().get().getId();
      scenarioIndex = 0;
      identifier = world.createGame(scenario);
   }

   @When("Viewing the games of the scenario")
   public void viewing_games_of_scenario() {
      navigateToScenario();
      world.getExpectedPage(ScenarioPage.class).requireIsReady();
   }
}
