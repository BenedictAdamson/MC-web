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
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertAll;

import java.util.Objects;

import javax.annotation.concurrent.Immutable;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * <p>
 * A <i>page object</i> for the users page.
 * </p>
 */
@Immutable
public final class UsersPage extends Page {

   private static final By USER_LIST_LOCATOR = By.tagName("ul");

   private static final String PATH = "/user";

   private static final By ADD_USER_LINK_LOCATOR = By.xpath("a[@id='add-user']");

   /**
    * <p>
    * Construct a user page associated with a given home page.
    * </p>
    *
    * @param homePage
    *           The web home page.
    * @throws NullPointerException
    *            If {@code homePage} is null.
    */
   public UsersPage(final HomePage homePage) {
      super(homePage);
   }

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
   public UsersPage(final WebDriver webDriver) {
      super(webDriver);
   }

   private void assertHasHeadingSayingUsers(final WebElement body) {
      final var heading = assertHasElement(body, By.tagName("h2"));
      assertThat("Has a heading saying \"Users\"", heading.getText(),
               containsString("Users"));
   }

   public void assertHasListOfUsers() {
      assertHasListOfUsers(getBody());
   }

   private void assertHasListOfUsers(final WebElement body) {
      assertHasElement(body, USER_LIST_LOCATOR);
   }

   public void assertListOfUsersIncludes(final String name) {
      Objects.requireNonNull(name, "name");
      final var list = assertHasElement(getBody(), USER_LIST_LOCATOR);
      assertThat(list.getText(), containsString(name));
   }

   public void assertListOfUsersNotEmpty() {
      final var list = assertHasElement(getBody(), USER_LIST_LOCATOR);
      assertThat(list.findElements(By.tagName("li")), not(empty()));
   }

   @Override
   protected void assertValidBody(final WebElement body) {
      assertAll(() -> assertHasHeadingSayingUsers(body),
               () -> assertHasListOfUsers(body));
   }

   public boolean hasAddUserLink() {
      return !getBody().findElements(ADD_USER_LINK_LOCATOR).isEmpty();
   }

   @Override
   protected boolean isValidPath(final String path) {
      Objects.requireNonNull(path, "path");
      return PATH.equals(path);
   }

   public AddUserPage navigateToAddUserPage() {
      requireIsReady();
      final var link = getBody().findElement(ADD_USER_LINK_LOCATOR);
      link.click();
      final var addUserPage = new AddUserPage(this);
      addUserPage.awaitIsReady();
      return addUserPage;
   }

   public UserPage navigateToUserPage(final int index) {
      if (index < 0) {
         throw new IllegalArgumentException("negative index");
      }
      requireIsReady();
      final var list = getBody().findElement(USER_LIST_LOCATOR);
      final var entries = list.findElements(By.tagName("li"));
      final WebElement entry;
      try {
         entry = entries.get(index);
      } catch (final IndexOutOfBoundsException e) {
         throw new IllegalArgumentException("index too large", e);
      }
      final var link = entry.findElement(By.tagName("a"));
      final var displayName = link.getText();
      link.click();
      final var userPage = new UserPage(this, displayName);
      userPage.awaitIsReady();
      return userPage;
   }

}
