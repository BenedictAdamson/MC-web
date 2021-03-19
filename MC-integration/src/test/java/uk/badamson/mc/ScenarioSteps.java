package uk.badamson.mc;
/*
 * © Copyright Benedict Adamson 2020-21.
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
import uk.badamson.mc.presentation.ScenarioPage;
import uk.badamson.mc.presentation.ScenariosPage;

/**
 * <p>
 * Definitions of BDD steps, for features about game scenarios.
 * </p>
 */
public class ScenarioSteps extends Steps {

   private int scenarioIndex;

   @Autowired
   public ScenarioSteps(@Nonnull final World world) {
      super(world);
   }

   @When("examining scenario")
   public void examining_scenario() {
      navigateToScenario().requireIsReady();
   }

   @When("examine scenarios")
   public void examine_scenarios() {
      navigateToScenariosPage();
      world.getAndAssertExpectedPage(ScenariosPage.class).assertInvariants();
   }

   @When("MC serves the scenario")
   public void mc_serves_scenario_page() {
      world.getExpectedPage(ScenarioPage.class).assertInvariants();
   }

   @When("navigate to a scenario with games")
   public void navigate_to_scenario_with_games() {
      final var scenariosPage = world.getExpectedPage(ScenariosPage.class);
      final var index = 0;
      world.setExpectedPage(scenariosPage.navigateToScenario(index));
   }

   private ScenarioPage navigateToScenario() {
      final var scenarioPage = world.getHomePage().navigateToScenariosPage()
               .navigateToScenario(scenarioIndex);
      world.setExpectedPage(scenarioPage);
      return scenarioPage;
   }

   private void navigateToScenariosPage() {
      world.setExpectedPage(world.getHomePage().navigateToScenariosPage());
   }

   @Then("the response is a list of scenarios")
   public void response_is_list_of_scenarios() {
      world.getAndAssertExpectedPage(ScenariosPage.class)
               .assertHasListOfScenarios();
   }

   @When("a scenario has games")
   public void scenario_has_games() {
      final var scenario = world.getScenarios().findFirst().get().getId();
      scenarioIndex = 0;
      world.createGame(scenario);
   }

   @Then("the scenario allows navigation to game pages")
   public void scenario_allows_navigation_to_game_pages()
            throws Exception {
      // FIXME

   }

   @Then("the scenario does not allow navigation to game pages")
   public void scenario_does_not_allow_navigation_to_game_pages()
            throws Exception {
      // FIXME
   }

   @Then("the scenario includes the list of games of that scenario")
   public void scenario_includes_list_of_games_of_scenario() {
      world.getAndAssertExpectedPage(ScenarioPage.class).assertHasListOfGames();
   }

   @Then("the scenario includes the scenario description")
   public void scenario_includes_scenario_description() {
      // Hard to test
   }

   @Then("the scenario includes the list of playable characters of that scenario")
   public void scenario_includes_the_list_of_playable_characters_of_that_scenario() {
      world.getAndAssertExpectedPage(ScenarioPage.class)
               .assertHasListOfCharacters();
   }

   @When("viewing the scenarios")
   public void viewing_scenarios() {
      navigateToScenariosPage();
   }
}
