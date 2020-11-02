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

import java.util.List;
import java.util.Objects;

import javax.annotation.concurrent.Immutable;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

/**
 * <p>
 * A <i>page object</i> for a scenario page.
 * </p>
 */
@Immutable
public final class ScenarioPage extends Page {

   private static final String BASE = "/scenario/";

   private static final By GAMES_LIST_LOCATOR = By.id("games");

   private final String scenarioTitle;

   /**
    * <p>
    * Construct a scenario page associated with a given scenarios page and
    * having a given (expected) title.
    * </p>
    *
    * @param scenariosPage
    *           The scenarios page.
    * @param scenarioTitle
    *           The expected title.
    * @throws NullPointerException
    *            If {@code scenariosPage} is null. If {@code scenarioTitle} is
    *            null.
    */
   public ScenarioPage(final ScenariosPage scenariosPage,
            final String scenarioTitle) {
      super(scenariosPage);
      this.scenarioTitle = Objects.requireNonNull(scenarioTitle,
               "scenarioTitle");
   }

   @Override
   public void assertInvariants() {
      assertAll(() -> super.assertInvariants(),
               () -> assertThat("displays the scenario title", getBodyText(),
                        containsString(scenarioTitle)));
   }

   public List<WebElement> findGameElements() {
      requireIsCurrentPath();
      return findElement(GAMES_LIST_LOCATOR).findElements(By.tagName("li"));
   }

   public String getScenarioTitle() {
      return scenarioTitle;
   }

   @Override
   protected boolean isValidPath(final String path) {
      Objects.requireNonNull(path, "path");
      return path.startsWith(BASE);
   }

   public GamePage navigateToGamePage(final int gameIndex) {
      requireIsCurrentPath();
      final var listEntry = findGameElements().get(gameIndex);
      final var title = listEntry.getText();
      final var link = listEntry.findElement(By.tagName("a"));
      link.click();
      final var gamePage = new GamePage(this, title);
      gamePage.awaitIsCurrentPageOrErrorMessage();
      return gamePage;
   }

}
