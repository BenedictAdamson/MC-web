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
import uk.badamson.mc.presentation.HomePage;
import uk.badamson.mc.presentation.ScenarioPage;
import uk.badamson.mc.presentation.ScenariosPage;

/**
 * <p>
 * Definitions of BDD steps, for features about game scenarios.
 * </p>
 */
public class ScenarioSteps extends Steps {

   @Autowired
   public ScenarioSteps(@Nonnull final WorldCore worldCore) {
      super(worldCore);
   }

   private HomePage getHomePage() {
      final var homePage = new HomePage(worldCore.getWebDriver());
      homePage.get();
      currentPage = homePage;
      return homePage;
   }

   @When("getting the scenarios")
   public void getting_scenarios() {
      navigateToScenariosPage();
   }

   @When("MC serves the scenario page")
   public void mc_serves_scenario_page() {
      final var scenarioPage = (ScenarioPage) currentPage;
      scenarioPage.assertIsCurrentPage();
      scenarioPage.assertInvariants();
   }

   @Then("MC serves the scenarios page")
   public void mc_serves_scenarios_page() {
      final var scenariosPage = (ScenariosPage) currentPage;
      scenariosPage.assertIsCurrentPage();// guard
      scenariosPage.assertInvariants();
   }

   @When("Navigate to one scenario")
   public void navigate_to_one_scenario() {
      final var scenariosPage = (ScenariosPage) currentPage;
      final var index = 0;
      currentPage = scenariosPage.navigateToScenario(index);
   }

   private void navigateToScenariosPage() {
      currentPage = getHomePage().navigateToScenariosPage();
   }

   @Then("the response is a list of scenarios")
   public void response_is_list_of_scenarios() {
      final var scenariosPage = (ScenariosPage) currentPage;
      scenariosPage.assertHasListOfScenarios();
   }

   @When("Viewing the scenarios")
   public void viewing_scenarios() {
      navigateToScenariosPage();
   }
}
