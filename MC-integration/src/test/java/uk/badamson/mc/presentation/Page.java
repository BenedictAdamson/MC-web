package uk.badamson.mc.presentation;
/*
 * © Copyright Benedict Adamson 2019-22.
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
import static org.hamcrest.Matchers.isA;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertAll;

import java.net.URI;
import java.time.Duration;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Predicate;

import javax.annotation.Nonnull;

import org.hamcrest.CustomTypeSafeMatcher;
import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.StringDescription;
import org.hamcrest.TypeSafeDiagnosingMatcher;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
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
   public final class NotReadyException extends IllegalStateException {

      public NotReadyException() {
         super(createNotReadyMessage());
      }

      public NotReadyException(final String message) {
         super(message);
      }

      public NotReadyException(final String message, final Throwable cause) {
         super(message, cause);
      }

      public NotReadyException(final Throwable cause) {
         super(createNotReadyMessage(), cause);
      }

   }// class

   protected static abstract class WebElementMatcher
            extends TypeSafeDiagnosingMatcher<WebElement> {

      @Override
      public void describeTo(final Description description) {
         description.appendText("Element matches");
      }
   }// class

   /**
    * <p>
    * How error messages are expected to be marked up in pages.
    * </p>
    */
   public static final By ERROR_LOCATOR = By.className("error");

   private static final By BODY_LOCATOR = By.tagName("body");

   private static final Matcher<WebElement> HAS_ERROR_ELEMENT = new WebElementMatcher() {

      @Override
      public void describeTo(final Description description) {
         description.appendText("Has an element with the error class");
      }

      @Override
      protected boolean matchesSafely(final WebElement item,
               final Description mismatchDescription) {
         return !item.findElements(ERROR_LOCATOR).isEmpty();
      }
   };

   /**
    * <p>
    * Require that a parent element contains an element.
    * </p>
    *
    * @param message
    *           An assertion message to use if reporting that this assertino
    *           failed
    * @param parent
    *           The element to search
    * @param by
    *           A matcher for the required element
    * @throws NullPointerException
    *            <ul>
    *            <li>if {@code message} is null</li>
    *            <li>if {@code parent} is null</li>
    *            <li>if {@code by} is null</li>
    *            </ul>
    * @throws AssertionFailedError
    *            if no such element is present.
    */
   protected static final WebElement assertHasElement(final String message,
            final WebElement parent, final By by) {
      Objects.requireNonNull(message, "message");
      Objects.requireNonNull(parent, "parent");
      Objects.requireNonNull(by, "by");

      try {
         return parent.findElement(by);
      } catch (final NoSuchElementException e) {
         throw new AssertionFailedError(message, e);
      }
   }

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
    *            <ul>
    *            <li>if {@code parent} is null</li>
    *            <li>if {@code by} is null</li>
    *            </ul>
    * @throws AssertionFailedError
    *            if no such element is present.
    */
   protected static final WebElement assertHasElement(final WebElement parent,
            final By by) {
      return assertHasElement("Has element " + by, parent, by);
   }

   private static URI createUrl(final String path) {
      return McContainers.createIngressPrivateNetworkUriFromPath(path);
   }

   private static String getPathOfUrl(final String url) {
      return URI.create(url).getPath();
   }

   /**
    * <p>
    * Whether a (control or navigation) element is <i>enabled</i>
    * </p>
    * <p>
    * Enabled elements respond to mouse clicks.
    * </p>
    *
    * @param element
    *           The element to examine
    * @return whether the {@code element} is enabled
    * @throws NullPointerException
    *            If {@code element} is null.
    */
   protected static final boolean isEnabled(final WebElement element) {
      Objects.requireNonNull(element, "element");
      return element.getAttribute("disabled") == null;
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

   public final void awaitIsReady() throws NotReadyException {
      awaitIsReady(isA(WebElement.class));
   }

   protected final void awaitIsReady(
            @Nonnull final Matcher<WebElement> additionalBodyConstraints)
            throws IllegalStateException {
      try {
         new WebDriverWait(webDriver, Duration.ofSeconds(17))
                  .until(driver -> isReady(driver, additionalBodyConstraints));
      } catch (final TimeoutException e) {
         requireIsReady(); // throws NotReadyException, with good diagnostics,
                           // if still not ready
         // OK, the final check was OK, so *just* became ready in time
      } catch (final Exception e) {// give better diagnostics
         throw new NotReadyException(e);
      }
   }

   public final void awaitIsReadyOrErrorMessage() throws IllegalStateException {
      try {
         new WebDriverWait(webDriver, Duration.ofSeconds(17))
                  .until(driver -> isReady(driver, isA(WebElement.class))
                           || HAS_ERROR_ELEMENT
                                    .matches(driver.findElement(BODY_LOCATOR)));
      } catch (final TimeoutException e) {
         try {
            /* Use requireIsReady to get a good diagnostic exception */
            requireIsReady();
         } catch (final NotReadyException e2) {
            throw new NotReadyException("Not ready and no error message", e2);
         }
         // OK, the final check was OK, so *just* became ready in time
      } catch (final Exception e) {// give better diagnostics
         throw new NotReadyException(e);
      }
   }

   public final void awaitIsReadyAndErrorMessage() throws IllegalStateException {
      try {
         new WebDriverWait(webDriver, Duration.ofSeconds(17))
                 .until(driver -> isReady(driver, isA(WebElement.class))
                         && HAS_ERROR_ELEMENT
                         .matches(driver.findElement(BODY_LOCATOR)));
      } catch (final Exception e) {// give better diagnostics
         throw new NotReadyException(e);
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

   private boolean isReady(final WebDriver driver,
            final Matcher<WebElement> additionalRequirements) {
      final var body = driver.findElement(BODY_LOCATOR);
      try {
         requireIsReady(getPathOfUrl(driver.getCurrentUrl()), driver.getTitle(),
                  body);
         requireForReady("Additional body constraints", body,
                  additionalRequirements);
      } catch (final NotReadyException e) {
         return false;
      }
      return true;
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

   protected <T> void requireForReady(final String requirementDescription,
            final T value, final Matcher<T> requirement)
            throws NotReadyException {
      if (!requirement.matches(value)) {
         final Description description = new StringDescription();
         description.appendText("Not ready because requires ")
                  .appendText(System.lineSeparator())
                  .appendText(requirementDescription)
                  .appendText(System.lineSeparator())
                  .appendDescriptionOf(requirement)
                  .appendText(System.lineSeparator()).appendText("     but: ");
         requirement.describeMismatch(value, description);
         throw new NotReadyException(description.toString());
      }
   }

   public final void requireIsReady() throws NotReadyException {
      requireIsReady(getCurrentPath(), getTitle(), getBody());
   }

   /**
    * <p>
    * Throw an exception if a given page is not a page of this type in its ready
    * (loaded) state.
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
    * @throws NullPointerException
    *            <ul>
    *            <li>If {@code path} is null.</li>
    *            <li>If {@code title} is null.</li>
    *            <li>If {@code body} is null.</li>
    *            </ul>
    * @throws NotReadyException
    *            If, and only if, the page is not ready
    */
   protected void requireIsReady(@Nonnull final String path,
            @Nonnull final String title, final @Nonnull WebElement body)
            throws NotReadyException {
      if (!isValidPath(path)) {
         throw new NotReadyException("Invalid path " + path);
      }
   }
}
