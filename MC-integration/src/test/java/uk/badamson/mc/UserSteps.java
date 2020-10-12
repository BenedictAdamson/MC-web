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

import static java.util.stream.Collectors.toUnmodifiableList;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertAll;

import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.concurrent.TimeoutException;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.opentest4j.AssertionFailedError;
import org.springframework.beans.factory.annotation.Autowired;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

/**
 * <p>
 * Definitions of BDD steps for the Cucumber-JVM BDD testing tool for steps
 * pertaining to users.
 * </p>
 */
public class UserSteps {

   private static final By ADD_USER_LINK_LOCATOR = By.id("add-user");

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

   private WebElement element;

   @When("adding a user named {string} with  password {string}")
   public void adding_a_user(final String user, final String password) {
      getUrlUsingBrowser("/users");
      final var webDriver = worldCore.getWebDriver();
      webDriver.findElement(ADD_USER_LINK_LOCATOR).click();
      webDriver.findElement(By.name("username")).sendKeys(user);
      webDriver.findElement(By.xpath("//input[@type='password']"))
               .sendKeys(password);
      webDriver.findElement(By.xpath("//button[@type='submit']")).submit();
   }

   private void assertCurrentUrlPath(final String expectedPath) {
      assertThat("Current URL path", worldCore.getCurrentUrlPath(),
               is(expectedPath));
   }

   public void assertHaveErrorMessages() {
      assertThat("Error message(s)",
               worldCore.getWebDriver().findElements(By.className("error")),
               not(empty()));
   }

   private void assertIsUsersPage() {
      findElementWithTag("h2");
      assertThat("Has a header saying \"Users\"", element.getText(),
               containsString("Users"));
   }

   private void assertNoErrorMessages() {
      final var elements = worldCore.getWebDriver()
               .findElements(By.className("error"));
      // Report the error messages, to provide better diagnostics
      assertThat("No error messages", elements.stream().map(e -> e.getText())
               .collect(toUnmodifiableList()), is(empty()));
   }

   private void awaitSuccessOrErrorMessage(
            final String expectedSuccessUrlPath) {
      try {
         new WebDriverWait(worldCore.getWebDriver(), 17).until(driver -> {
            return expectedSuccessUrlPath
                     .equals(WorldCore.getPathOfUrl(driver.getCurrentUrl()))
                     || !driver.findElements(By.className("error")).isEmpty();
         });
      } catch (final Exception e) {// give better diagnostics
         throw new IllegalStateException(
                  "No indication of login success or failure", e);
      }
   }

   @Then("can get the list of users")
   public void can_get_list_of_users() {
      getUrlUsingBrowser("/user");
      assertIsUsersPage();
   }

   @Then("MC does not present adding a user as an option")
   public void does_not_present_adding_user_option() {
      getUrlUsingBrowser("/user");
      assertThat("No add-user link",
               worldCore.getWebDriver().findElements(ADD_USER_LINK_LOCATOR),
               empty());
   }

   /*
    * Sets {@code this.element} to the found element.
    *
    * @throws AssertionFailedError if no such element is present.
    */
   private void findElementWithTag(final String tag) {
      Objects.requireNonNull(tag, "tag");
      try {
         element = worldCore.getWebDriver().findElement(By.tagName(tag));
      } catch (final NoSuchElementException e) {
         element = null;
         throw new AssertionFailedError("has element with tag " + tag, e);
      }
   }

   private void getHomePage() {
      getUrlUsingBrowser("/");
   }

   @When("getting the users")
   public void getting_users() {
      getUrlUsingBrowser("/user");
   }

   private void getUrlUsingBrowser(final String path) {
      worldCore.setUrlPath(path);
      worldCore.getUrlUsingBrowser();
   }

   @Then("the list of users includes a user named {string}")
   public void list_of_users_includes(final String name) {
      findElementWithTag("ul");
      assertThat(element.getText(), containsString(name));
   }

   @Then("the list of users has at least one user")
   public void list_of_users_not_empty() {
      Objects.requireNonNull(element);
      assertThat(element.findElements(By.tagName("li")), not(empty()));
   }

   @Given("logged in")
   public void logged_in() {
      tryToLogin();
      assertCurrentUrlPath("/");
   }

   @When("log in using correct password")
   public void login_using_correct_password() throws TimeoutException {
      tryToLogin();
   }

   @Then("MC accepts the login")
   public void mc_accepts_login() {
      assertAll(() -> assertCurrentUrlPath("/"), () -> assertNoErrorMessages());
   }

   @Then("MC accepts the addition")
   public void mc_accepts_the_addition() {
      awaitSuccessOrErrorMessage("/users");
   }

   @Then("MC rejects the login")
   public void mc_rejects_login() {
      assertAll(() -> assertCurrentUrlPath("/login"),
               () -> assertHaveErrorMessages());
   }

   @Then("MC serves the users page")
   public void mc_serves_users_page() {
      assertIsUsersPage();
   }

   @Then("redirected to home-page")
   public void redirected_to_home_page() {
      assertThat("URL path", worldCore.getCurrentUrlPath(), is("/"));
   }

   @Then("the response is a list of users")
   public void response_is_list_of_users() {
      findElementWithTag("ul");
   }

   private void submitLogin(final String name, final String password) {
      getHomePage();
      final var webDriver = worldCore.getWebDriver();
      webDriver.findElement(By.id("login")).click();
      webDriver.findElement(By.name("username")).sendKeys(name);
      webDriver.findElement(By.xpath("//input[@type='password']"))
               .sendKeys(password);
      webDriver.findElement(By.xpath("//button[@type='submit']")).submit();
   }

   @When("try to login")
   public void try_to_login() throws Exception {
      tryToLogin();
   }

   private void tryToLogin() {
      Objects.requireNonNull(user, "user");
      submitLogin(user.getUsername(), user.getPassword());
      awaitSuccessOrErrorMessage("/");
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
