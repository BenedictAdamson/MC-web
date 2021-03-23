package uk.badamson.mc.presentation;
/*
 * © Copyright Benedict Adamson 2019-21.
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
import static org.hamcrest.Matchers.not;

import java.util.Objects;
import java.util.Optional;

import javax.annotation.concurrent.Immutable;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * <p>
 * A <i>page object</i> for the home page.
 * </p>
 */
@Immutable
public final class HomePage extends Page {

   private static final Matcher<String> LOGGED_IN_TEXT_MATCHER = containsString(
            "Logged in");

   public static final String GAME_NAME = "Mission Command";

   private static final String PATH = "/";

   private static final By LOGOUT_BUTTON_LOCATOR = By
            .xpath("//button[@id='logout']");

   private static final By LOGIN_LINK_LOCATOR = By.id("login");

   private static final By SELF_LINK_LOCATOR = By.xpath("//a[@id='self']");

   private static final By USERS_LINK_LOCATOR = By.xpath("//a[@id='users']");

   private static final By CURRENT_GAME_LINK_LOCATOR = By
            .xpath("//a[@id='current-game']");

   private static final Matcher<WebElement> HAS_CURRENT_GAME_LINK = new WebElementMatcher() {

      @Override
      protected boolean matchesSafely(final WebElement body,
               final Description mismatchDescription) {
         return !body.findElements(CURRENT_GAME_LINK_LOCATOR).isEmpty();
      }

   };

   /**
    * <p>
    * Construct a page object using a given web driver interface.
    * </p>
    *
    * @param webDriver
    *           The web driver interface to use for accessing the page.
    * @throws NullPointerException
    *            If {@codewebDriver} is null.
    */
   public HomePage(final WebDriver webDriver) {
      super(webDriver);
   }

   public void assertHeadingIncludesNameOfGame() {
      assertHeadingIncludesNameOfGame(getBody());
   }

   private void assertHeadingIncludesNameOfGame(final WebElement body) {
      final var heading = assertHasElement(body, By.tagName("h1"));// guard
      assertThat(heading.getText(), containsString(GAME_NAME));
   }

   public void assertReportsThatLoggedIn() {
      assertThat("Reports that is logged in", getBody().getText(),
               LOGGED_IN_TEXT_MATCHER);
   }

   public void assertReportsThatNotLoggedIn() {
      assertThat("Reports that is not logged in", getBody().getText(),
               not(LOGGED_IN_TEXT_MATCHER));
   }

   public void assertTitleIncludesNameOfGame() {
      assertTitleIncludesNameOfGame(getTitle());
   }

   private void assertTitleIncludesNameOfGame(final String title) {
      assertThat(title, containsString(GAME_NAME));
   }

   @Override
   protected void assertValidBody(final WebElement body) {
      assertHeadingIncludesNameOfGame(body);
   }

   @Override
   protected void assertValidTitle(final String title) {
      assertTitleIncludesNameOfGame(title);
   }

   public boolean doesIndicateUserHasCurrentGame() {
      return !getBody().findElements(CURRENT_GAME_LINK_LOCATOR).isEmpty();
   }

   @Override
   protected Optional<String> getValidPath() {
      return Optional.of(PATH);
   }

   public boolean hasExamineCurrentUserLink() {
      return !getBody().findElements(SELF_LINK_LOCATOR).isEmpty();
   }

   public boolean hasUsersLink() {
      return !getBody().findElements(USERS_LINK_LOCATOR).isEmpty();
   }

   public boolean isLoginEnabled() {
      return isEnabled(getBody().findElement(LOGIN_LINK_LOCATOR));
   }

   public boolean isLogoutButtonEnabled() {
      return isEnabled(getBody().findElement(LOGOUT_BUTTON_LOCATOR));
   }

   public boolean isLogoutEnabled() {
      return isEnabled(getBody().findElement(LOGOUT_BUTTON_LOCATOR));
   }

   @Override
   protected boolean isValidPath(final String path) {
      Objects.requireNonNull(path, "path");
      return PATH.equals(path);
   }

   public void logout() {
      final var button = getBody().findElement(LOGOUT_BUTTON_LOCATOR);
      button.click();
      awaitIsReady();
   }

   public GamePage navigateToCurrentGamePage() {
      final WebElement currentGameLink;
      try {
         awaitIsReady(HAS_CURRENT_GAME_LINK);
         requireIsReady();
         currentGameLink = getBody().findElement(CURRENT_GAME_LINK_LOCATOR);
      } catch (IllegalStateException | NoSuchElementException e) {
         throw new IllegalStateException(
                  "Not ready to navigate to current-game page", e);
      }
      currentGameLink.click();
      final var gamePage = new GamePage(this);
      gamePage.awaitIsReady();
      return gamePage;
   }

   public LoginPage navigateToLoginPage() {
      requireIsReady();
      getBody().findElement(LOGIN_LINK_LOCATOR).click();
      final var loginPage = new LoginPage(this);
      loginPage.awaitIsReady();
      return loginPage;
   }

   public ScenariosPage navigateToScenariosPage() {
      requireIsReady();
      getBody().findElement(By.id("scenarios")).click();
      final var scenariosPage = new ScenariosPage(this);
      scenariosPage.awaitIsReady();
      return scenariosPage;
   }

   public UsersPage navigateToUsersPage() {
      final WebElement usersLink;
      try {
         requireIsReady();
         usersLink = getBody().findElement(USERS_LINK_LOCATOR);
      } catch (IllegalStateException | NoSuchElementException e) {
         throw new IllegalStateException("Not ready to navigate to users page",
                  e);
      }
      usersLink.click();
      final var usersPage = new UsersPage(this);
      usersPage.awaitIsReady();
      return usersPage;
   }
}
