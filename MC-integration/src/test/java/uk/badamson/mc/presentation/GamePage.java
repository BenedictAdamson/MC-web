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

import java.util.Objects;

import javax.annotation.Nonnull;
import javax.annotation.concurrent.Immutable;

import org.hamcrest.Matcher;
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

   private final String scenarioTitle;

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
    *           The expected creation time.
    * @throws NullPointerException
    *            If {@code scenariosPage} is null. If {@code title} is null.
    */
   public GamePage(final ScenarioPage scenarioPage, final String creationTime) {
      super(scenarioPage);
      Objects.requireNonNull(creationTime, "creationTime");
      this.scenarioTitle = scenarioPage.getScenarioTitle();
      includesCreationTime = containsString(creationTime);
      includesScenarioTitile = containsString(scenarioTitle);
   }

   public void assertIncludesCreationTime() {
      assertThat("includes creation time", getBody().getText(),
               includesCreationTime);
   }

   public void assertIncludesScenarioTitle() {
      assertThat("includes scenario title", getBody().getText(),
               includesScenarioTitile);
   }

   @Override
   protected void assertValidBody(@Nonnull final WebElement body) {
      assertThat("Body text", body.getText(), allOf(INDICATES_IS_A_GAME,
               includesCreationTime, includesScenarioTitile));
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
}
