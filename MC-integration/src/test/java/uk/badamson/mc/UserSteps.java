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
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Locale;
import java.util.Objects;
import java.util.Set;

import javax.annotation.Nonnull;

import org.opentest4j.AssertionFailedError;
import org.springframework.beans.factory.annotation.Autowired;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import uk.badamson.mc.presentation.HomePage;
import uk.badamson.mc.presentation.LoginPage;
import uk.badamson.mc.presentation.UserPage;
import uk.badamson.mc.presentation.UsersPage;

/**
 * <p>
 * Definitions of BDD steps for the Cucumber-JVM BDD testing tool for steps
 * pertaining to users.
 * </p>
 */
public class UserSteps extends Steps {

   private static Authority parseRole(final String role) {
      try {
         return Authority.valueOf(
                  "ROLE_" + role.replace(' ', '_').toUpperCase(Locale.ENGLISH));
      } catch (final Exception e) {
         throw new IllegalArgumentException("roleName " + role, e);
      }
   }

   private User user;

   @Autowired
   public UserSteps(@Nonnull final World world) {
      super(world);
   }

   @When("adding a user named {string} with  password {string}")
   public void adding_a_user(final String user, final String password) {
      world.setExpectedPage(navigateToUsersPage().navigateToAddUserPage()
               .submitForm(user, password));
   }

   @Then("can get the list of users")
   public void can_get_list_of_users() {
      world.getAndAssertExpectedPage(UsersPage.class).assertInvariants();
   }

   @Then("MC does not allow adding a user")
   public void does_not_allow_adding_user() {
      final var usersPage = navigateToUsersPage();
      assertFalse(usersPage.hasAddUserLink(), "Add user link is absent");
   }

   @When("getting the users")
   public void getting_users() {
      navigateToUsersPage();
   }

   @Given("Viewing the list of users")
   public void given_viewing_list_of_users() {
      navigateToUsersPage();
   }

   @Then("the list of users includes a user named {string}")
   public void list_of_users_includes(final String name) {
      Objects.requireNonNull(name, "name");

      final var usersPage = world.getAndAssertExpectedPage(UsersPage.class);
      usersPage.assertInvariants();
      usersPage.assertListOfUsersIncludes(name);
   }

   @Then("the list of users has at least one user")
   public void list_of_users_not_empty() {
      world.getAndAssertExpectedPage(UsersPage.class)
               .assertListOfUsersNotEmpty();
   }

   @Given("logged in")
   public void logged_in() {
      world.getHomePage();
      tryToLogin();
   }

   @When("log in using correct password")
   public void login_using_correct_password() {
      world.getHomePage();
      tryToLogin();
   }

   @Then("MC accepts the login")
   public void mc_accepts_login() {
      final var homePage = world.getAndAssertExpectedPage(HomePage.class);
      assertAll(() -> homePage.assertInvariants(),
               () -> homePage.assertNoErrorMessages(),
               () -> homePage.assertReportsThatLoggedIn());
   }

   @Then("MC accepts the logout")
   public void mc_accepts_logout() {
      final var homePage = world.getAndAssertExpectedPage(HomePage.class);
      assertAll(() -> homePage.assertInvariants(),
               () -> homePage.assertNoErrorMessages(),
               () -> homePage.assertReportsThatNotLoggedIn());
   }

   @Then("MC accepts the addition")
   public void mc_accepts_the_addition() {
      try {
         world.getAndAssertExpectedPage(UsersPage.class)
                  .awaitIsReadyOrErrorMessage();
      } catch (final IllegalStateException e) {
         throw new AssertionFailedError(e.getMessage(), e);
      }
   }

   @Then("MC allows examining the current user")
   public void mc_allows_examining_current_user() {
      final var homePage = world.getAndAssertExpectedPage(HomePage.class);
      assertTrue(homePage.hasExamineCurrentUserLink(),
               "has link for examining the current user");
   }

   @Then("MC allows logging in")
   public void mc_allows_logging_in() {
      final var homePage = world.getAndAssertExpectedPage(HomePage.class);
      assertTrue(homePage.isLoginEnabled());
   }

   @Then("MC allows logout")
   public void mc_allows_logout() {
      final var homePage = world.getAndAssertExpectedPage(HomePage.class);
      assertTrue(homePage.isLogoutEnabled());
   }

   @Then("MC does not allow examining the current user")
   public void mc_does_not_allow_examining_current_user() {
      final var homePage = world.getAndAssertExpectedPage(HomePage.class);
      assertFalse(homePage.hasExamineCurrentUserLink(),
               "does not have link for examining the current user");
   }

   @Then("MC does not allow listing users")
   public void mc_does_not_allow_listing_users() {
      final var homePage = world.getAndAssertExpectedPage(HomePage.class);
      assertFalse(homePage.hasUsersLink(),
               "does not have link for listing users");
   }

   @Then("MC does not allow logout")
   public void mc_does_not_allow_logout() {
      final var homePage = world.getAndAssertExpectedPage(HomePage.class);
      assertFalse(homePage.isLogoutButtonEnabled());
   }

   @Then("MC rejects the login")
   public void mc_rejects_login() {
      world.getAndAssertExpectedPage(LoginPage.class).assertRejectedLogin();
   }

   @Then("MC serves the user page")
   public void mc_serves_user_page() {
      final var userPage = world.getAndAssertExpectedPage(UserPage.class);
      userPage.assertInvariants();
      userPage.assertNoErrorMessages();
   }

   @Then("MC serves the users page")
   public void mc_serves_users_page() {
      world.getAndAssertExpectedPage(UsersPage.class).assertInvariants();
   }

   @When("Navigate to one user page")
   public void navigate_to_one_user_page() {
      final var usersPage = world.getExpectedPage(UsersPage.class);
      world.setExpectedPage(usersPage.navigateToUserPage(0));

   }

   private UsersPage navigateToUsersPage() {
      final var homePage = world.getExpectedPage(HomePage.class);
      final var usersPage = homePage.navigateToUsersPage();
      world.setExpectedPage(usersPage);
      return usersPage;
   }

   @Given("not logged in")
   public void not_logged_in() {
      world.getHomePage();
   }

   @Then("redirected to home-page")
   public void redirected_to_home_page() {
      world.getAndAssertExpectedPage(HomePage.class).assertInvariants();
   }

   @When("request logout")
   public void request_logout() {
      final var homePage = world.getAndAssertExpectedPage(HomePage.class);
      homePage.logout();
   }

   @Then("the response is a list of users")
   public void response_is_list_of_users() {
      final var usersPage = world.getAndAssertExpectedPage(UsersPage.class);
      assertAll(() -> usersPage.assertInvariants(),
               () -> usersPage.assertHasListOfUsers());
   }

   @When("try to login")
   public void try_to_login() {
      world.getHomePage();
      tryToLogin();
   }

   private void tryToLogin() {
      Objects.requireNonNull(user, "user");
      final var homePage = world.getExpectedPage(HomePage.class);
      final var loginPage = homePage.navigateToLoginPage();
      world.setExpectedPage(loginPage);
      loginPage.submitLoginForm(user.getUsername(), user.getPassword());
      homePage.awaitIsReadyOrErrorMessage();
      if (homePage.isCurrentPath()) {
         world.setExpectedPage(homePage);
      }
   }

   @Given("unknown user")
   public void unknown_user() {
      user = world.getUnknownUser();
   }

   @Given("user does not have the {string} role")
   public void user_does_not_have_role(final String roleName) {
      user = world.getUserWithoutRole(parseRole(roleName));
   }

   @Given("user has any role")
   public void user_has_any_role() {
      user = world.getUserWithRoles(Set.of(Authority.values()[0]), Set.of());
   }

   @Given("user has the {string} role")
   public void user_has_role(final String roleName) {
      user = world.getUserWithRoles(Set.of(parseRole(roleName)), Set.of());
   }

   @When("user has the {string} role but not the {string} role")
   public void user_has_role_but_not_role(final String included,
            final String excluded) {
      final var includedRole = parseRole(included);
      final var excludedRole = parseRole(excluded);
      if (includedRole == excludedRole) {
         throw new IllegalArgumentException("Contradictory role constraints");
      }

      user = world.getUserWithRoles(Set.of(includedRole), Set.of(excludedRole));
   }

   @Given("user is the administrator")
   public void user_is_administrator() {
      user = world.getAdministratorUser();
   }

   @Then("The user page includes the user name")
   public void user_page_includes_user_name() {
      world.getAndAssertExpectedPage(UserPage.class).assertIncludesUserName();
   }

   @Then("The user page lists the roles of the user")
   public void user_page_lists_roles_of_user() {
      world.getAndAssertExpectedPage(UserPage.class).assertListsRolesOfUser();
   }

   @When("Viewing the list of users")
   public void when_viewing_list_of_users() {
      navigateToUsersPage();
   }
}
