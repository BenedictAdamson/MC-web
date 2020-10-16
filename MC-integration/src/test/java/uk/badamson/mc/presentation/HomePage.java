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

import java.net.URI;
import java.util.Objects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

import uk.badamson.mc.McContainers;

/**
 * <p>
 * A <i>page object</i> for the home page.
 * </p>
 */
public class HomePage {

   public static final String GAME_NAME = "Mission Command";

   private static final String PATH = "/";

   private static final By HEADER = By.tagName("h1");

   private static URI createUrl(final String path) {
      return McContainers.createIngressPrivateNetworkUriFromPath(path);
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
   public HomePage(final WebDriver webDriver) {
      this.webDriver = Objects.requireNonNull(webDriver, "webDriver");
   }

   public void assertHeaderIncludesNameOfGame() {
      assertThat(webDriver.findElement(HEADER).getText(),
               containsString(GAME_NAME));
   }

   public void assertInvariants() {
      assertAll("Home page invariant", () -> assertHeaderIncludesNameOfGame(),
               () -> assertTitleIncludesNameOfGame());
   }

   public void assertTitleIncludesNameOfGame() {
      assertThat(webDriver.getTitle(), containsString(GAME_NAME));
   }

   public void get() {
      webDriver.get(createUrl(PATH).toASCIIString());
   }
}
