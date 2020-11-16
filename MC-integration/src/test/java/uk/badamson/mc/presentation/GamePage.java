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
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.matchesPattern;

import java.util.Objects;

import javax.annotation.Nonnull;
import javax.annotation.concurrent.Immutable;

import org.hamcrest.Matcher;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.springframework.web.util.UriTemplate;

/**
 * <p>
 * A <i>page object</i> for a game page.
 * </p>
 */
@Immutable
public final class GamePage extends Page {

   private static final UriTemplate URI_TEMPLATE = new UriTemplate(
            "/scenario/{scenario}/game/{created}");
   private static final Matcher<String> INDICATES_IS_A_GAME = containsString(
            "Game");
   private static final Matcher<String> INDICATES_WHETHER_RECRUITING_PLAYERS = matchesPattern(
            "[Rr]ecruiting");
   private static final Matcher<String> INDICATES_IS_RECUITING_PLAYERS = containsString(
            "This game is recruiting players");
   private static final By SCENARIO_LINK_LOCATOR = By.id("scenario");
   private static final By RECRUITING_ELEMENT_LOCATOR = By.id("recruiting");

   private final ScenarioPage scenarioPage;
   private final Matcher<String> includesCreationTime;
   private final Matcher<String> includesScenarioTitile;

   /**
    * <p>
    * Construct a game page associated with a given scenario page and having a
    * given (expected) title.
    * </p>
    *
    * @param scenarioPage
    *           The scenarios page.
    * @param creationTime
    *           The expected creation time. Or {@code null} if the creation time
    *           is unknown.
    * @throws NullPointerException
    *            If {@code scenariosPage} is null.
    */
   public GamePage(final ScenarioPage scenarioPage, final String creationTime) {
      super(scenarioPage);
      this.scenarioPage = scenarioPage;
      includesCreationTime = creationTime == null ? null
               : containsString(creationTime);
      includesScenarioTitile = containsString(scenarioPage.getScenarioTitle());
   }

   public void assertIncludesCreationTime() {
      if (includesCreationTime != null) {
         assertThat("includes creation time", getBody().getText(),
                  includesCreationTime);
      }
      // else can not check
   }

   public void assertIncludesScenarioTitle() {
      assertThat("includes scenario title", getBody().getText(),
               includesScenarioTitile);
   }

   public void assertIndicatesIsRecruitingPlayers() {
      final var element = assertHasElement(getBody(),
               RECRUITING_ELEMENT_LOCATOR);
      assertThat(element.getText(), INDICATES_IS_RECUITING_PLAYERS);
   }

   public void assertIndicatesWhetherRecruitingPlayers() {
      assertThat("text mentions recruiting", getBody().getText(),
               INDICATES_WHETHER_RECRUITING_PLAYERS);
      assertHasElement(getBody(), RECRUITING_ELEMENT_LOCATOR);
   }

   @Override
   protected void assertValidBody(@Nonnull final WebElement body) {
      if (includesCreationTime != null) {
         assertThat("Body text", body.getText(),
                  allOf(INDICATES_IS_A_GAME,
                           INDICATES_WHETHER_RECRUITING_PLAYERS,
                           includesCreationTime, includesScenarioTitile));
      } // else can not check
   }

   @Override
   protected boolean isReady(@Nonnull final String path,
            @Nonnull final String title, final @Nonnull WebElement body) {
      return isValidPath(path) && INDICATES_IS_A_GAME.matches(body.getText());
   }

   @Override
   protected boolean isValidPath(@Nonnull final String path) {
      Objects.requireNonNull(path, "path");
      return URI_TEMPLATE.matches(path);
   }

   public ScenarioPage navigateToScenarioPage() {
      requireIsReady();
      final var link = getBody().findElement(SCENARIO_LINK_LOCATOR);
      link.click();
      scenarioPage.awaitIsReady();
      return scenarioPage;
   }
}
