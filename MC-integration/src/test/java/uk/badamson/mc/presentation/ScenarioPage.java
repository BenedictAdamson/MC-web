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

/**
 * <p>
 * A <i>page object</i> for a scenario page.
 * </p>
 */
@Immutable
public final class ScenarioPage extends Page {

   private static final String BASE = "/scenario/";

   private final String title;

   /**
    * <p>
    * Construct a scenario page associated with a given scenarios page and
    * having a given (expected) title.
    * </p>
    *
    * @param scenariosPage
    *           The scenarios page.
    * @param title
    *           The expected title.
    * @throws NullPointerException
    *            If {@code scenariosPage} is null. If {@code title} is null.
    */
   public ScenarioPage(final ScenariosPage scenariosPage, final String title) {
      super(scenariosPage);
      this.title = Objects.requireNonNull(title, "title");
   }

   @Override
   public void assertInvariants() {
      assertAll(() -> super.assertInvariants(),
               () -> assertThat("displays the scenario title", getBodyText(),
                        containsString(title)));
   }

   @Override
   protected boolean isValidPath(final String path) {
      Objects.requireNonNull(path, "path");
      return path.startsWith(BASE);
   }

}
