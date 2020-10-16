package uk.badamson.mc.presentation;
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
import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertAll;

import java.util.Objects;
import java.util.Optional;

import javax.annotation.concurrent.Immutable;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * <p>
 * A <i>page object</i> for the home page.
 * </p>
 */
@Immutable
public final class HomePage extends Page {

   public static final String GAME_NAME = "Mission Command";

   private static final String PATH = "/";

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

   public void assertHeaderIncludesNameOfGame() {
      final var header = assertHasElementWithTag("h1");// guard
      assertThat(header.getText(), containsString(GAME_NAME));
   }

   @Override
   public void assertInvariants() {
      assertAll(() -> assertHeaderIncludesNameOfGame(),
               () -> assertTitleIncludesNameOfGame());
   }

   public void assertReportsThatLoggedIn() {
      assertThat("Reports that is logged in", getBodyText(),
               containsString("Logged in"));
   }

   public void assertTitleIncludesNameOfGame() {
      assertThat(getTitle(), containsString(GAME_NAME));
   }

   @Override
   protected Optional<String> getPath() {
      return Optional.of(PATH);
   }

   @Override
   protected boolean isValidPath(final String path) {
      Objects.requireNonNull(path, "path");
      return PATH.equals(path);
   }

   public LoginPage navigateToLoginPage() {
      requireIsCurrentPage();
      findElement(By.id("login")).click();
      final LoginPage loginPage = new LoginPage(this);
      loginPage.awaitIsCurrentPageOrErrorMessage();
      return loginPage;
   }

   public ScenariosPage navigateToScenariosPage() {
      requireIsCurrentPage();
      findElement(By.id("scenarios")).click();
      final ScenariosPage scenariosPage = new ScenariosPage(this);
      scenariosPage.awaitIsCurrentPageOrErrorMessage();
      return scenariosPage;
   }

   public UsersPage navigateToUsersPage() {
      requireIsCurrentPage();
      findElement(By.id("users")).click();
      final UsersPage usersPage = new UsersPage(this);
      usersPage.awaitIsCurrentPageOrErrorMessage();
      return usersPage;
   }
}
