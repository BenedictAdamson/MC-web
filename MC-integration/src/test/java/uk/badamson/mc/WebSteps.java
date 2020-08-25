package uk.badamson.mc;
/*
 * © Copyright Benedict Adamson 2019-20.
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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.annotation.DirtiesContext;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

/**
 * <p>
 * Definitions of BDD steps for the Cucumber-JVM BDD testing tool.
 */
@DirtiesContext
public class WebSteps {

   @Autowired
   private WorldCore worldCore;

   @When("adding a user named {string} with  password {string}")
   public void adding_a_user_named(final String name, final String password) {
      Objects.requireNonNull(name, "name");
      Objects.requireNonNull(password, "password");
      // TODO
   }

   @Then("can get the list of users")
   public void can_get_the_list_of_users() {
      // TODO
   }

   @Then("MC forbids the request")
   public void mc_forbids_the_request() {
      // TODO
   }

   @Then("MC serves the home page")
   public void mc_serves_the_home_page() {
      worldCore.get();
   }

   @Given("the DNS name, example.com, of an MC server")
   public void the_DNS_name_of_an_MC_server() {
      /*
       * Do nothing; the test set up hard-codes the DNS name as
       * McContainers.INGRESS_HOST
       */
   }

   @When("the potential user gives the obvious URL http://example.com/ to a web browser")
   public void the_potential_user_gives_the_obvious_URL_to_a_web_browser() {
      worldCore.setPath("/");
   }

}
