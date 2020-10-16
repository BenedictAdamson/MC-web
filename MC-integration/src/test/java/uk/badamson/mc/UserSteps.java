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
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertAll;

import java.util.Objects;

import org.openqa.selenium.By;
import org.opentest4j.AssertionFailedError;
import org.springframework.beans.factory.annotation.Autowired;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import uk.badamson.mc.presentation.HomePage;
import uk.badamson.mc.presentation.UsersPage;

/**
 * <p>
 * Definitions of BDD steps for the Cucumber-JVM BDD testing tool for steps
 * pertaining to users.
 * </p>
 */
public class UserSteps {

   private static Authority parseRoleName(final String roleName) {
      final Authority role;
      try {
         role = Authority.valueOf(roleName);
      } catch (final Exception e) {
         throw new IllegalArgumentException("roleName", e);
      }
      return role;
   }

   @Autowired
   private WorldCore worldCore;

   @SuppressWarnings("unused")
   @Autowired
   private WorldCoreScenarioHook worldCoreScenarioHook;

   private User user;

   @When("adding a user named {string} with  password {string}")
   public void adding_a_user(final String user, final String password) {
      final UsersPage usersPage = navigateToUsersPage();
      usersPage.submitAddUserForm(user, password);
   }

   private void assertCurrentUrlPath(final String expectedPath) {
      assertThat("Current URL path", worldCore.getCurrentUrlPath(),
               is(expectedPath));
   }

   private void assertHaveErrorMessages() {
      assertThat("Error message(s)",
               worldCore.getWebDriver().findElements(By.className("error")),
               not(empty()));
   }

   @Then("can get the list of users")
   public void can_get_list_of_users() {
      final var page = new UsersPage(worldCore.getWebDriver());
      page.assertIsCurrentPage();// guard
      page.assertInvariants();
   }

   @Then("MC does not present adding a user as an option")
   public void does_not_present_adding_user_option() {
      final UsersPage usersPage = navigateToUsersPage();
      usersPage.assertHasNoAddUserLink();
   }

   private HomePage getHomePage() {
      return new HomePage(worldCore.getWebDriver());
   }

   @When("getting the users")
   public void getting_users() {
      navigateToUsersPage();
   }

   @Then("the list of users includes a user named {string}")
   public void list_of_users_includes(final String name) {
      Objects.requireNonNull(name, "name");

      final var page = new UsersPage(worldCore.getWebDriver());
      page.requireIsCurrentPage();
      page.assertListOfUsersIncludes(name);
   }

   @Then("the list of users has at least one user")
   public void list_of_users_not_empty() {
      final var page = new UsersPage(worldCore.getWebDriver());
      page.assertIsCurrentPage();// guard
      page.assertListOfUsersNotEmpty();
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
      final var page = getHomePage();
      assertAll(() -> page.assertIsCurrentPage(),
               () -> page.assertNoErrorMessages(),
               () -> page.assertReportsThatLoggedIn());
   }

   @Then("MC accepts the addition")
   public void mc_accepts_the_addition() {
      final var page = new UsersPage(worldCore.getWebDriver());
      try {
         page.awaitIsCurrentPageOrErrorMessage();
      } catch (final IllegalStateException e) {
         throw new AssertionFailedError(e.getMessage(), e);
      }
   }

   @Then("MC rejects the login")
   public void mc_rejects_login() {
      assertAll(() -> assertCurrentUrlPath("/login"),
               () -> assertHaveErrorMessages());
   }

   @Then("MC serves the users page")
   public void mc_serves_users_page() {
      final var page = new UsersPage(worldCore.getWebDriver());
      page.assertIsCurrentPage();// guard
      page.assertInvariants();
   }

   private UsersPage navigateToUsersPage() {
      final var homePage = getHomePage();
      return homePage.navigateToUsersPage();
   }

   @Then("redirected to home-page")
   public void redirected_to_home_page() {
      final var homePage = getHomePage();
      homePage.assertIsCurrentPage();
   }

   @Then("the response is a list of users")
   public void response_is_list_of_users() {
      final var page = new UsersPage(worldCore.getWebDriver());
      assertAll(() -> page.assertIsCurrentPage(),
               () -> page.assertHasListOfUsers());
   }

   @When("try to login")
   public void try_to_login() throws Exception {
      tryToLogin();
   }

   private void tryToLogin() {
      Objects.requireNonNull(user, "user");
      final var homePage = getHomePage();
      homePage.get();
      homePage.navigateToLoginPage().submitLoginForm(user.getUsername(),
               user.getPassword());
      homePage.awaitIsCurrentPageOrErrorMessage();
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
