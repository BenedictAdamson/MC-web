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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.is;

import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import uk.badamson.mc.WorldCore.User;

/**
 * <p>
 * Definitions of BDD steps for the Cucumber-JVM BDD testing tool for steps
 * pertaining to users.
 * </p>
 */
public class UserSteps {

   @Autowired
   private WorldCore worldCore;

   @SuppressWarnings("unused")
   @Autowired
   private WorldCoreScenarioHook worldCoreScenarioHook;

   private User user;

   @When("adding a user named {string} with  password {string}")
   public void adding_a_user(final String user, final String password) {
      // TODO
   }

   @Then("can get the list of users")
   public void can_get_list_of_users() {
      // TODO
   }

   @Then("MC does not present adding a user as an option")
   public void does_not_present_adding_user_option() {
      // TODO
   }

   private void getHomePage() {
      worldCore.setUrlPath("/");
      worldCore.getUrlUsingBrowser();
   }

   @When("getting the users")
   public void getting_users() {
      // TODO
   }

   @Then("the list of users includes a user named {string}")
   public void list_of_users_includes(final String name) {
      // TODO
   }

   @Then("the list of users has at least one user")
   public void list_of_users_not_empty() {
      // TODO
   }

   @Given("logged in")
   public void logged_in() {
      // TODO
   }

   private void login(final String name, final String password) {
      getHomePage();
      final var webDriver = worldCore.getWebDriver();
      webDriver.findElementById("login").click();
      webDriver.findElementByName("username").sendKeys(name);
      webDriver.findElementByXPath("//input[@type='password']")
               .sendKeys(password);
      webDriver.findElementByXPath(
               "//input[@type='submit'] or //button[@type='submit']").submit();
   }

   @When("log in using correct password")
   public void login_using_correct_password() {
      Objects.requireNonNull(user, "user");
      login(user.getName(), user.getPassword());
   }

   @Then("MC accepts the login")
   public void mc_accepts_login() {
      final var webDriver = worldCore.getWebDriver();
      assertThat("No error messages",
               webDriver.findElementsByClassName("error"), is(empty()));
   }

   @Then("MC accepts the addition")
   public void mc_accepts_the_addition() {
      // TODO
   }

   @Then("MC serves the users page")
   public void mc_serves_users_page() {
      // TODO
   }

   @Then("the response is a list of users")
   public void response_is_list_of_users() {
      // TODO
   }

   @Given("user does not have the {string} role")
   public void user_does_not_have_role(final String role) {
      // TODO
   }

   @Given("user has the {string} role")
   public void user_has_role(final String role) {
      user = worldCore.getUserWithRole(role);
   }
}
