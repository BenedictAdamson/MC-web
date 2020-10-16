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
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;

import java.net.URI;
import java.util.List;
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
 * A <i>page object</i>.
 * </p>
 * <p>
 * This is a Strategy class for accessing a web page.
 * </p>
 */
public abstract class Page {

   /**
    * <p>
    * How error messages are expected to be marked up in pages.
    * </p>
    */
   public static final By ERROR_LOCATOR = By.className("error");

   private static String getPathOfUrl(final String url) {
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
   protected Page(final WebDriver webDriver) {
      this.webDriver = Objects.requireNonNull(webDriver, "webDriver");
   }

   protected final WebElement findElement(By locator) {
      return webDriver.findElement(locator);
   }

   protected final List<WebElement> findElements(By locator) {
      return webDriver.findElements(locator);
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
   protected final WebElement assertHasElementWithTag(final String tag) {
      Objects.requireNonNull(tag, "tag");
      try {
         return findElement(By.tagName(tag));
      } catch (final NoSuchElementException e) {
         throw new AssertionFailedError("Has element with tag " + tag, e);
      }
   }

   public final void assertHasErrorMessage() {
      assertThat("Error message(s)", findElements(ERROR_LOCATOR), not(empty()));
   }

   public abstract void assertInvariants();

   public final void assertIsCurrentPage() {
      try {
         requireIsCurrentPage();
      } catch (final IllegalStateException e) {
         throw new AssertionFailedError(e.getMessage(), e);
      }
   }

   public final void assertNoErrorMessages() {
      final var elements = findElements(ERROR_LOCATOR);
      // Report the error messages, to provide better diagnostics
      final var errorMessages = elements.stream().map(e -> e.getText())
               .collect(toUnmodifiableList());
      assertThat("No error messages", errorMessages, is(empty()));
   }

   public final void awaitIsCurrentPageOrErrorMessage()
            throws IllegalStateException {
      final var currentPath = new AtomicReference<String>();
      try {
         new WebDriverWait(webDriver, 17).until(driver -> {
            currentPath.set(getPathOfUrl(driver.getCurrentUrl()));
            return isValidPath(currentPath.get())
                     || !driver.findElements(ERROR_LOCATOR).isEmpty();
         });
      } catch (final Exception e) {// give better diagnostics
         throw new IllegalStateException(
                  "No indication of success or failure (at " + currentPath.get()
                           + ")",
                  e);
      }
   }

   /**
    * <p>
    * Whether a given URI {@linkplain URI#getPath() path component} of a URI is
    * a valid value for this type of page.
    * </p>
    * 
    * @param path
    *           the path component to examine
    * @return whether {@code path} is valid
    * @throws NullPointerException
    *            If {@code path} is null.
    */
   protected abstract boolean isValidPath(String path);

   public final void requireIsCurrentPage() throws IllegalStateException {
      final var currentPath = getPathOfUrl(webDriver.getCurrentUrl());
      if (!isValidPath(currentPath)) {
         throw new IllegalStateException("Current path (" + currentPath + ")");
      }
   }

}
