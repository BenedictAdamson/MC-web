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

import static java.util.stream.Collectors.toUnmodifiableList;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;

import java.net.URI;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicReference;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.opentest4j.AssertionFailedError;

/**
 * <p>
 * A <i>page object</i> for the users page.
 * </p>
 */
public class UsersPage {

   private static final String PATH = "/user";

   private static final By ERROR_LOCATOR = By.className("error");

   private static final By ADD_USER_LINK_LOCATOR = By.id("add-user");

   protected static String getPathOfUrl(final String url) {
      return URI.create(url).getPath();
   }

   private final WebDriver webDriver;

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
      this.webDriver = Objects.requireNonNull(webDriver, "webDriver");
   }

   protected void assertCurrentUrlPath(final String expectedPath) {
      try {
         requireCurrentUrlPath(expectedPath);
      } catch (final IllegalStateException e) {
         throw new AssertionFailedError(e.getMessage(), e);
      }
   }

   /**
    * Require that the current page has an element with a given tag.
    *
    * @param tag
    *           The HTML tag of the required element
    * @throws NullPointerException
    *            if {@code tag} is null
    * @throws AssertionFailedError
    *            if no such element is present.
    */
   protected WebElement assertHasElementWithTag(final String tag) {
      Objects.requireNonNull(tag, "tag");
      try {
         return webDriver.findElement(By.tagName(tag));
      } catch (final NoSuchElementException e) {
         throw new AssertionFailedError("Has element with tag " + tag, e);
      }
   }

   public void assertHasListOfUsers() {
      assertHasElementWithTag("ul");
   }

   public void assertHasNoAddUserLink() {
      assertThat("No add-user link",
               webDriver.findElements(ADD_USER_LINK_LOCATOR), empty());
   }

   public void assertHaveErrorMessages() {
      assertThat("Error message(s)", webDriver.findElements(ERROR_LOCATOR),
               not(empty()));
   }

   public void assertInvariants() {
      final var element = assertHasElementWithTag("h2");
      assertThat("Has a header saying \"Users\"", element.getText(),
               containsString("Users"));
      assertHasListOfUsers();
   }

   public void assertIsCurrentPage() {
      try {
         requireIsCurrentPage();
      } catch (final IllegalStateException e) {
         throw new AssertionFailedError(e.getMessage(), e);
      }
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

   public void assertNoErrorMessages() {
      final var elements = webDriver.findElements(ERROR_LOCATOR);
      // Report the error messages, to provide better diagnostics
      final var errorMessages = elements.stream().map(e -> e.getText())
               .collect(toUnmodifiableList());
      assertThat("No error messages", errorMessages, is(empty()));
   }

   protected void awaitCurrentUrlPathOrErrorMessage(
            final String expectedSuccessUrlPath) throws IllegalStateException {
      final var currentPath = new AtomicReference<String>();
      try {
         new WebDriverWait(webDriver, 17).until(driver -> {
            currentPath.set(getPathOfUrl(driver.getCurrentUrl()));
            return expectedSuccessUrlPath.equals(currentPath.get())
                     || !driver.findElements(ERROR_LOCATOR).isEmpty();
         });
      } catch (final Exception e) {// give better diagnostics
         throw new IllegalStateException(
                  "No indication of success or failure (at " + currentPath.get()
                           + ")",
                  e);
      }
   }

   public void awaitIsCurrentPageOrErrorMessage() throws IllegalStateException {
      awaitCurrentUrlPathOrErrorMessage(PATH);
   }

   /**
    * <p>
    * The {@linkplain URI#getPath() path} component of the
    * {@linkplain WebDriver#getCurrentUrl() current URL} of the browser.
    * </p>
    * <p>
    * Tests should use value, rather than the current URL of the browser,
    * because the current URL includes the server host-name, which is a test
    * implementation detail.
    * </p>
    *
    * @return the path; not null.
    */
   public String getCurrentUrlPath() {
      return getPathOfUrl(webDriver.getCurrentUrl());
   }

   protected void requireCurrentUrlPath(final String path) {
      Objects.requireNonNull(path, "path");
      final var currentPath = getCurrentUrlPath();
      if (!currentPath.equals(path)) {
         throw new IllegalStateException(
                  "Current page (" + currentPath + ") is not " + path);
      }
   }

   public void requireIsCurrentPage() throws IllegalStateException {
      requireCurrentUrlPath(PATH);
   }

   public void submitAddUserForm(final String user, final String password) {
      Objects.requireNonNull(user, "user");
      Objects.requireNonNull(password, "password");
      requireCurrentUrlPath(PATH);

      webDriver.findElement(ADD_USER_LINK_LOCATOR).click();
      webDriver.findElement(By.name("username")).sendKeys(user);
      webDriver.findElement(By.xpath("//input[@type='password']"))
               .sendKeys(password);
      webDriver.findElement(By.xpath("//button[@type='submit']")).submit();
   }

}
