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

import static org.junit.jupiter.api.Assertions.assertAll;

import java.util.Objects;

import javax.annotation.Nonnull;

import org.opentest4j.AssertionFailedError;
import org.springframework.beans.factory.annotation.Autowired;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import uk.badamson.mc.presentation.HomePage;
import uk.badamson.mc.presentation.LoginPage;
import uk.badamson.mc.presentation.UsersPage;

/**
 * <p>
 * Definitions of BDD steps for the Cucumber-JVM BDD testing tool for steps
 * pertaining to users.
 * </p>
 */
public class UserSteps extends Steps {

   private static Authority parseRoleName(final String roleName) {
      final Authority role;
      try {
         role = Authority.valueOf(roleName);
      } catch (final Exception e) {
         throw new IllegalArgumentException("roleName", e);
      }
      return role;
   }

   private User user;

   @Autowired
   public UserSteps(@Nonnull final World worldCore) {
      super(worldCore);
   }

   @When("adding a user named {string} with  password {string}")
   public void adding_a_user(final String user, final String password) {
      navigateToUsersPage().submitAddUserForm(user, password);
   }

   @Then("can get the list of users")
   public void can_get_list_of_users() {
      final var usersPage = (UsersPage) worldCore.expectedPage;
      usersPage.assertInvariants();
   }

   @Then("MC does not present adding a user as an option")
   public void does_not_present_adding_user_option() {
      navigateToUsersPage().assertHasNoAddUserLink();
   }

   @When("getting the users")
   public void getting_users() {
      navigateToUsersPage();
   }

   @Then("the list of users includes a user named {string}")
   public void list_of_users_includes(final String name) {
      Objects.requireNonNull(name, "name");

      final var usersPage = (UsersPage) worldCore.expectedPage;
      usersPage.requireIsCurrentPath();
      usersPage.assertListOfUsersIncludes(name);
   }

   @Then("the list of users has at least one user")
   public void list_of_users_not_empty() {
      final var usersPage = (UsersPage) worldCore.expectedPage;
      usersPage.assertListOfUsersNotEmpty();
   }

   @Given("logged in")
   public void logged_in() {
      tryToLogin();
   }

   @When("log in using correct password")
   public void login_using_correct_password() {
      tryToLogin();
   }

   @Then("MC accepts the login")
   public void mc_accepts_login() {
      final var homePage = (HomePage) worldCore.expectedPage;
      assertAll(() -> homePage.assertInvariants(),
               () -> homePage.assertNoErrorMessages(),
               () -> homePage.assertReportsThatLoggedIn());
   }

   @Then("MC accepts the addition")
   public void mc_accepts_the_addition() {
      final var usersPage = (UsersPage) worldCore.expectedPage;
      try {
         usersPage.awaitIsCurrentPageOrErrorMessage();
      } catch (final IllegalStateException e) {
         throw new AssertionFailedError(e.getMessage(), e);
      }
   }

   @Then("MC rejects the login")
   public void mc_rejects_login() {
      final var loginPage = (LoginPage) worldCore.expectedPage;
      loginPage.assertRejectedLogin();
   }

   @Then("MC serves the users page")
   public void mc_serves_users_page() {
      final var usersPage = (UsersPage) worldCore.expectedPage;
      usersPage.assertInvariants();
   }

   private UsersPage navigateToUsersPage() {
      final var homePage = (HomePage) worldCore.expectedPage;
      final var usersPage = homePage.navigateToUsersPage();
      worldCore.expectedPage = usersPage;
      return usersPage;
   }

   @Then("redirected to home-page")
   public void redirected_to_home_page() {
      final var homePage = (HomePage) worldCore.expectedPage;
      homePage.assertInvariants();
   }

   @Then("the response is a list of users")
   public void response_is_list_of_users() {
      final var usersPage = (UsersPage) worldCore.expectedPage;
      assertAll(() -> usersPage.assertInvariants(),
               () -> usersPage.assertHasListOfUsers());
   }

   @When("try to login")
   public void try_to_login() {
      tryToLogin();
   }

   private void tryToLogin() {
      Objects.requireNonNull(user, "user");
      final var homePage = worldCore.getHomePage();
      final var loginPage = homePage.navigateToLoginPage();
      worldCore.expectedPage = loginPage;
      loginPage.submitLoginForm(user.getUsername(), user.getPassword());
      homePage.awaitIsCurrentPageOrErrorMessage();
      if (homePage.isCurrentPage()) {
         worldCore.expectedPage = homePage;
      }
   }

   @Given("unknown user")
   public void unknown_user() {
      user = worldCore.getUnknownUser();
   }

   @Given("user does not have the {string} role")
   public void user_does_not_have_role(final String roleName) {
      user = worldCore.getUserWithoutRole(parseRoleName(roleName));
   }

   @Given("user has the {string} role")
   public void user_has_role(final String roleName) {
      user = worldCore.getUserWithRole(parseRoleName(roleName));
   }

   @Given("user is the administrator")
   public void user_is_administrator() {
      user = worldCore.getAdministratorUser();
   }
}
