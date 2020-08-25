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

   private final WorldCore sut = new WorldCore();

   @When("adding a user named {string} with  password {string}")
   public void adding_a_user_named(final String name, final String password) {
      Objects.requireNonNull(name, "name");
      Objects.requireNonNull(password, "password");
      // TODO
   }

   @After
   public void afterScenario(final Scenario scenario) {
      sut.endScenario(scenario);
   }

   @Before
   public void beforeScenario(final Scenario scenario) {
      sut.beginScenario(scenario);
   }

   @Then("can get the list of users")
   public void can_get_the_list_of_users() {
      // TODO
   }

   @Override
   public void close() {
      sut.close();
   }

   @When("getting the unknown resource at {string}")
   public void getting_the_unknown_resource_at(final String path) {
      // TODO
   }

   @When("getting the users")
   public void getting_the_users() {
      // TODO
   }

   @When("log in as {string} using password {string}")
   public void log_in_as_using_password(final String user,
            final String password) {
      Objects.requireNonNull(user, "user");
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

   @Then("MC serves the home page")
   public void mc_serves_the_home_page() {
      sut.get();
   }

   @Then("MC serves the resource")
   public void mc_serves_the_users_resource() {
      // TODO
   }

   @When("modifying the unknown resource with a {string} at {string}")
   public void modifying_the_unknown_resource_with_a(final String verb,
            final String path) {
      // TODO
   }

   @Given("that user {string} exists with  password {string}")
   public void that_user_exists_with_password(final String user,
            final String password) {
      Objects.requireNonNull(user, "user");
      Objects.requireNonNull(password, "password");
      // TODO
   }

   @Given("the DNS name, example.com, of an MC server")
   public void the_DNS_name_of_an_MC_server() {
      /*
       * Do nothing; the test set up hard-codes the DNS name as
       * McContainers.INGRESS_HOST
       */
   }

   @Then("the list of users has one user")
   public void the_list_of_users_has_one_user() {
      // TODO
   }

   @Then("the list of users includes a user named {string}")
   public void the_list_of_users_includes_a_user_named(final String name) {
      // TODO
   }

   @Then("the list of users includes the administrator")
   public void the_list_of_users_includes_the_administrator() {
      // TODO
   }

   @When("the potential user gives the DNS name to a web browser")
   public void the_potential_user_gives_the_DNS_name_to_a_web_browser() {
      // TODO
   }

   @When("the potential user gives the obvious URL http://example.com/ to a web browser")
   public void the_potential_user_gives_the_obvious_URL_to_a_web_browser() {
      sut.setPath("/");
   }

   @Then("the response message is a list of users")
   public void the_response_message_is_a_list_of_users() {
      // TODO
   }

   @Given("user authenticated as Administrator")
   public void user_authenticated_as_Administrator() {
      // TODO
   }

}
