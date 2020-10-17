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
 * A <i>page object</i> for the scenarios page.
 * </p>
 */
@Immutable
public final class ScenariosPage extends Page {

   private static final String PATH = "/scenario";

   /**
    * <p>
    * Construct a user page associated with a given home page.
    * </p>
    *
    * @param homePage
    *           The web home page.
    * @throws NullPointerException
    *            If {@code homePage} is null.
    */
   public ScenariosPage(final HomePage homePage) {
      super(homePage);
   }

   public void assertHasListOfScenarios() {
      assertHasElementWithTag("ul");
   }

   @Override
   public void assertInvariants() {
      assertAll(
               () -> assertThat("Has a header saying \"Scenarios\"",
                        assertHasElementWithTag("h2").getText(),
                        containsString("Scenarios")),
               () -> assertHasListOfScenarios());
   }

   @Override
   protected boolean isValidPath(final String path) {
      Objects.requireNonNull(path, "path");
      return PATH.equals(path);
   }

}
