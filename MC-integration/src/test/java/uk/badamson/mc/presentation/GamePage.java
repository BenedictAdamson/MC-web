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

import java.util.Objects;

import javax.annotation.concurrent.Immutable;

import org.springframework.web.util.UriTemplate;

/**
 * <p>
 * A <i>page object</i> for a game page.
 * </p>
 */
@Immutable
public final class GamePage extends Page {

   private static final UriTemplate URI_TEMPLATE = new UriTemplate(
            "/api/scenario/{scenario}/game/{game}");

   private final String scenarioTitle;
   private final String gameTitle;

   /**
    * <p>
    * Construct a game page associated with a given scenario page and having a
    * given (expected) title.
    * </p>
    *
    * @param scenarioPage
    *           The scenarios page.
    * @param gameTitle
    *           The expected title.
    * @throws NullPointerException
    *            If {@code scenariosPage} is null. If {@code title} is null.
    */
   public GamePage(final ScenarioPage scenarioPage, final String gameTitle) {
      super(scenarioPage);
      this.scenarioTitle = scenarioPage.getScenarioTitle();
      this.gameTitle = Objects.requireNonNull(gameTitle, "title");
   }

   @Override
   public void assertInvariants() {
      final var bodyText = getBodyText();
      assertAll(() -> super.assertInvariants(),
               () -> assertThat("displays the game title", bodyText,
                        containsString(gameTitle)));
   }

   @Override
   protected boolean isValidPath(final String path) {
      Objects.requireNonNull(path, "path");
      return URI_TEMPLATE.matches(path);
   }

}
