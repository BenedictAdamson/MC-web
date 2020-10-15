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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;

import org.openqa.selenium.WebElement;
import org.springframework.beans.factory.annotation.Autowired;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

/**
 * <p>
 * Definitions of BDD steps, for features about game scenarios.
 * </p>
 */
public class ScenarioSteps {

   @Autowired
   private WorldCore worldCore;

   private WebElement element;

   private void assertIsScenariosPage() {
      element = worldCore.assertHasElementWithTag("h2");
      assertThat("Has a header saying \"Scenarios\"", element.getText(),
               containsString("Scenarios"));
   }

   private void getScenarios() throws Exception {
      worldCore.getUrlUsingBrowser("/scenario");
      assertIsScenariosPage();
   }

   @When("getting the scenarios")
   public void getting_scenarios() throws Exception {
      getScenarios();
   }

   @Then("MC serves the scenarios page")
   public void mc_serves_scenarios_page() throws Exception {
      assertIsScenariosPage();
   }

   @Then("the response is a list of scenarios")
   public void response_is_list_of_scenarios() {
      element = worldCore.assertHasElementWithTag("ul");
   }
}
