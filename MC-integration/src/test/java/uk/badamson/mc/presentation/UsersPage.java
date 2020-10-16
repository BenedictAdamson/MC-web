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

import java.util.Objects;

import javax.annotation.concurrent.Immutable;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * <p>
 * A <i>page object</i> for the users page.
 * </p>
 */
@Immutable
public final class UsersPage extends Page {

   private static final String PATH = "/user";

   private static final By ADD_USER_LINK_LOCATOR = By.id("add-user");

   /**
    * <p>
    * Construct a user page assocaited with a given home page.
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

   public void assertHasListOfUsers() {
      assertHasElementWithTag("ul");
   }

   public void assertHasNoAddUserLink() {
      assertThat("No add-user link", findElements(ADD_USER_LINK_LOCATOR),
               empty());
   }

   @Override
   public void assertInvariants() {
      final var element = assertHasElementWithTag("h2");
      assertThat("Has a header saying \"Users\"", element.getText(),
               containsString("Users"));
      assertHasListOfUsers();
   }

   public void assertListOfUsersIncludes(final String name) {
      Objects.requireNonNull(name, "name");
      final var list = assertHasElementWithTag("ul");
      assertThat(list.getText(), containsString(name));
   }

   public void assertListOfUsersNotEmpty() {
      final var list = assertHasElementWithTag("ul");
      assertThat(list.findElements(By.tagName("li")), not(empty()));
   }

   @Override
   protected boolean isValidPath(final String path) {
      Objects.requireNonNull(path, "path");
      return PATH.equals(path);
   }

   public void submitAddUserForm(final String user, final String password) {
      Objects.requireNonNull(user, "user");
      Objects.requireNonNull(password, "password");
      requireIsCurrentPage();

      findElement(ADD_USER_LINK_LOCATOR).click();
      findElement(By.name("username")).sendKeys(user);
      findElement(By.xpath("//input[@type='password']")).sendKeys(password);
      findElement(By.xpath("//button[@type='submit']")).submit();
   }

}
