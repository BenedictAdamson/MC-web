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

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

/**
 * <p>
 * Definitions of BDD steps for the Cucumber-JVM BDD testing tool.
 */
public class WebSteps implements AutoCloseable {

   private WorldCore worldCore;

   @When("adding a player named {string} with  password {string}")
   public void adding_a_player_named(final String name, final String password) {
      Objects.requireNonNull(name, "name");
      Objects.requireNonNull(password, "password");
      // TODO
   }

   @After
   public void afterScenario(final Scenario scenario) {
      worldCore.endScenario(scenario);
   }

   @Before
   public void beforeScenario(final Scenario scenario) {
      worldCore = WorldCore.getInstance(scenario);
      worldCore.beginScenario(scenario);
   }

   @Then("can get the list of players")
   public void can_get_the_list_of_players() {
      // TODO
   }

   @Override
   public void close() {
      if (worldCore != null) {
         worldCore.close();
      }
   }

   @When("getting the players")
   public void getting_the_players() {
      // TODO
   }

   @When("getting the unknown resource at {string}")
   public void getting_the_unknown_resource_at(final String path) {
      // TODO
   }

   @When("log in as {string} using password {string}")
   public void log_in_as_using_password(final String player,
            final String password) {
      Objects.requireNonNull(player, "player");
      Objects.requireNonNull(password, "password");
      // TODO
   }

   @Given("logged in as {string}")
   public void logged_in_as(final String name) {
      // TODO
   }

   @Then("MC accepts the addition")
   public void mc_accepts_the_addition() {
      // TODO
   }

   @Then("MC accepts the login")
   public void mc_accepts_the_login() {
      // TODO
   }

   @Then("MC forbids the request")
   public void mc_forbids_the_request() {
      // TODO
   }

   @Then("MC replies with Forbidden")
   public void mc_replies_with_forbidden() {
      // TODO
   }

   @Then("MC replies with Not Found")
   public void mc_replies_with_not_found() {
      // TODO
   }

   @Then("MC serves the resource")
   public void mc_serves_the_players_resource() {
      // TODO
   }

   @When("modifying the unknown resource with a {string} at {string}")
   public void modifying_the_unknown_resource_with_a(final String verb,
            final String path) {
      // TODO
   }

   @Given("presenting a valid CSRF token")
   public void presenting_a_valid_CSRF_token() {
      // Do nothing: the front-end code should be doing this implicitly.
   }

   @Given("that player {string} exists with  password {string}")
   public void that_player_exists_with_password(final String player,
            final String password) {
      Objects.requireNonNull(player, "player");
      Objects.requireNonNull(password, "password");
      // TODO
   }

   @Then("the list of players has one player")
   public void the_list_of_players_has_one_player() {
      // TODO
   }

   @Then("the list of players includes a player named {string}")
   public void the_list_of_players_includes_a_player_named(final String name) {
      // TODO
   }

   @Then("the list of players includes the administrator")
   public void the_list_of_players_includes_the_administrator() {
      // TODO
   }

   @When("the potential player gives the DNS name to a web browser")
   public void the_potential_player_gives_the_DNS_name_to_a_web_browser() {
      // TODO
   }

   @Then("the response message is a list of players")
   public void the_response_message_is_a_list_of_players() {
      // TODO
   }

   @Given("user authenticated as Administrator")
   public void user_authenticated_as_Administrator() {
      // TODO
   }

}
