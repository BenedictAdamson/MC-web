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
import static org.junit.jupiter.api.Assertions.assertAll;

import java.net.URI;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Predicate;

import javax.annotation.Nonnull;

import org.hamcrest.CustomTypeSafeMatcher;
import org.hamcrest.Matcher;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.opentest4j.AssertionFailedError;

import uk.badamson.mc.McContainers;

/**
 * <p>
 * A <i>page object</i>.
 * </p>
 * <p>
 * This is a Strategy class for accessing a web page.
 * </p>
 */
public abstract class Page {

   @SuppressWarnings("serial")
   private final class NotReadyException extends IllegalStateException {

      public NotReadyException() {
         this(null);
      }

      public NotReadyException(final Throwable cause) {
         super(createNotReadyMessage(), cause);
      }

   }// class

   /**
    * <p>
    * How error messages are expected to be marked up in pages.
    * </p>
    */
   public static final By ERROR_LOCATOR = By.className("error");

   private static final By BODY_LOCATOR = By.tagName("body");

   /**
    * <p>
    * Require that a parent element contains an element.
    * </p>
    *
    * @param parent
    *           The element to search
    * @param by
    *           A matcher for the required element
    * @throws NullPointerException
    *            if {@code by} is null
    * @throws AssertionFailedError
    *            if no such element is present.
    */
   protected static final WebElement assertHasElement(final WebElement parent,
            final By by) {
      Objects.requireNonNull(parent, "parent");
      Objects.requireNonNull(by, "by");
      try {
         return parent.findElement(by);
      } catch (final NoSuchElementException e) {
         throw new AssertionFailedError("Has element " + by, e);
      }
   }

   private static URI createUrl(final String path) {
      return McContainers.createIngressPrivateNetworkUriFromPath(path);
   }

   private static String getPathOfUrl(final String url) {
      return URI.create(url).getPath();
   }

   private final WebDriver webDriver;

   private final Matcher<String> IS_VALID_PATH = createMatcher("Has valid path",
            path -> isValidPath(path));

   /**
    * <p>
    * Construct a page object associated with an existing page.
    * </p>
    *
    * @param page
    *           The existing page.
    * @throws NullPointerException
    *            If {@code page} is null.
    */
   protected Page(@Nonnull final Page page) {
      this.webDriver = Objects.requireNonNull(page, "page").webDriver;
   }

   /**
    * <p>
    * Construct a page object using a given web driver interface.
    * </p>
    *
    * @param webDriver
    *           The web driver interface to use for accessing the page.
    * @throws NullPointerException
    *            If {@code webDriver} is null.
    */
   protected Page(@Nonnull final WebDriver webDriver) {
      this.webDriver = Objects.requireNonNull(webDriver, "webDriver");
   }

   public final void assertHasErrorMessage() {
      assertThat("Error message(s)", getBody().findElements(ERROR_LOCATOR),
               not(empty()));
   }

   /**
    * <p>
    * Check that the current page conforms to all the invariants (general
    * expectations) of this type of page.
    * </p>
    */
   public final void assertInvariants() {
      assertAll(() -> assertValidPath(getCurrentPath()),
               () -> assertValidTitle(getTitle()),
               () -> assertValidBody(getBody()));
   }

   public final void assertNoErrorMessages() {
      final var elements = getBody().findElements(ERROR_LOCATOR);
      // Report the error messages, to provide better diagnostics
      final var errorMessages = elements.stream().map(e -> e.getText())
               .collect(toUnmodifiableList());
      assertThat("No error messages", errorMessages, is(empty()));
   }

   /**
    * <p>
    * Assert that a given page body is a valid body for this type of page.
    * </p>
    * <p>
    * The provided implementation does nothing; it allows all bodies.
    * </p>
    *
    * @param body
    *           the body to examine
    * @throws NullPointerException
    *            If {@code body} is null.
    * @throws AssertionError
    *            if, and only iff, {@code body} is not valid
    */
   protected void assertValidBody(@Nonnull final WebElement body) {
      // Do nothing
   }

   /**
    * <p>
    * Assert that a given URI {@linkplain URI#getPath() path component} of a URI
    * is a valid value for this type of page.
    * </p>
    * <p>
    * The provided implementation uses the {@link #isValidPath(String)}
    * predicate. That implementation should be useful for most cases, which do
    * not need complex diagnostic information for invalid paths.
    * </p>
    *
    * @param path
    *           the path component to examine
    * @throws NullPointerException
    *            If {@code path} is null.
    * @throws AssertionError
    *            if, and only iff, {@code path} is not valid
    * @see #isValidPath(String)
    */
   protected void assertValidPath(@Nonnull final String path) {
      assertThat(path, IS_VALID_PATH);
   }

   /**
    * <p>
    * Assert that a given page (window) title is a valid title for this type of
    * page.
    * </p>
    * <p>
    * The provided implementation does nothing; it allows all titles.
    * </p>
    *
    * @param title
    *           the title to examine
    * @throws NullPointerException
    *            If {@code title} is null.
    * @throws AssertionError
    *            if, and only iff, {@code title} is not valid
    */
   protected void assertValidTitle(@Nonnull final String title) {
      // Do nothing
   }

   public final void awaitIsReady() throws IllegalStateException {
      try {
         new WebDriverWait(webDriver, 17).until(driver -> isReady(driver));
      } catch (final Exception e) {// give better diagnostics
         throw new NotReadyException(e);
      }
   }

   public final void awaitIsReadyOrErrorMessage() throws IllegalStateException {
      try {
         new WebDriverWait(webDriver, 17).until(driver -> isReady(driver)
                  || !driver.findElements(ERROR_LOCATOR).isEmpty());
      } catch (final Exception e) {// give better diagnostics
         throw new IllegalStateException(
                  "No indication of success or failure (awaiting "
                           + getClass().getTypeName() + ", at "
                           + getCurrentPath() + ")",
                  e);
      }
   }

   private final <T> Matcher<T> createMatcher(final String decription,
            final Predicate<T> predicate) {
      return new CustomTypeSafeMatcher<>(decription) {

         @Override
         protected boolean matchesSafely(final T actual) {
            return predicate.test(actual);
         }

      };
   }

   private String createNotReadyMessage() {
      return "Page " + getClass().getSimpleName() + " not ready\nPath "
               + getCurrentPath() + "\nTitle " + getTitle() + "\nBody\n"
               + getBody().getText();
   }

   /**
    * <p>
    * Directly load this page, using an HTTP GET operation.
    * </p>
    * <p>
    * The method blocks until the load completes. It follows redirects.
    * </p>
    *
    * @throws UnsupportedOperationException
    *            If direct loading is impossible because the page does not have
    *            a {@linkplain #getValidPath() fixed path}.
    */
   public final void get() throws UnsupportedOperationException {
      final var path = getValidPath();
      if (path.isEmpty()) {
         throw new UnsupportedOperationException("No path to get");
      }
      webDriver.get(createUrl(path.get()).toASCIIString());
   }

   @Nonnull
   protected final WebElement getBody() {
      return webDriver.findElement(BODY_LOCATOR);
   }

   @Nonnull
   private String getCurrentPath() {
      return getPathOfUrl(webDriver.getCurrentUrl());
   }

   @Nonnull
   protected final String getTitle() {
      return webDriver.getTitle();
   }

   /**
    * <p>
    * The path component of a valid fixed URI for a page of this type.
    * </p>
    * <p>
    * All pages have a URI, but not all have an easily predictable fixed
    * (constant) URI, so the value is {@link Optional} to allow for cases that
    * there is not a fixed URI or is difficult to predict.
    * </p>
    * <p>
    * The provided implementation {@linkplain Optional#isEmpty() is empty}.
    * </p>
    *
    * @return the optional path; not null.
    */
   @Nonnull
   protected Optional<String> getValidPath() {
      return Optional.empty();
   }

   public final boolean isCurrentPath() {
      return isValidPath(getCurrentPath());
   }

   /**
    * <p>
    * Whether a given page is a page of this type in its ready (loaded) state.
    * </p>
    * <p>
    * The provided implementation checks only that the given {@code path}
    * {@linkplain #isValidPath(String) is a valid path for this type of page}.
    * </p>
    *
    * @param path
    *           The {@linkplain URI#getPath() path component} of the
    *           {@linkplain URI URI} of the page.
    * @param title
    *           The page (window) title of the page.
    * @param body
    *           the body of the page
    * @return whether ready.
    * @throws NullPointerException
    *            <ul>
    *            <li>If {@code path} is null.</li>
    *            <li>If {@code title} is null.</li>
    *            <li>If {@code body} is null.</li>
    *            </ul>
    */
   protected boolean isReady(@Nonnull final String path,
            @Nonnull final String title, final @Nonnull WebElement body) {
      return isValidPath(path);
   }

   private boolean isReady(final WebDriver driver) {
      return isReady(getPathOfUrl(driver.getCurrentUrl()), driver.getTitle(),
               driver.findElement(BODY_LOCATOR));
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
    * @see #assertValidPath(String)
    */
   protected abstract boolean isValidPath(@Nonnull String path);

   public final void requireIsReady() throws IllegalStateException {
      if (!isReady(webDriver)) {
         throw new NotReadyException();
      }
   }
}
