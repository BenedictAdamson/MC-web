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
import static org.hamcrest.Matchers.any;
import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.both;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.either;
import static org.junit.jupiter.api.Assertions.assertAll;

import java.util.Objects;

import javax.annotation.Nonnull;
import javax.annotation.concurrent.Immutable;

import org.hamcrest.Matcher;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.opentest4j.MultipleFailuresError;
import org.springframework.web.util.UriTemplate;

import uk.badamson.mc.User;

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
   private static final Matcher<String> INDICATES_WHETHER_RECRUITING_PLAYERS = containsString(
            "recruiting");
   private static final Matcher<String> INDICATES_IS_RECRUITING_PLAYERS = containsString(
            "This game is recruiting players");
   private static final Matcher<String> INDICATES_IS_NOT_RECRUITING_PLAYERS = containsString(
            "This game is not recruiting players");
   private static final Matcher<String> INDICATES_IS_NOT_JOINABLE = containsString(
            "You may not join this game");
   private static final Matcher<String> INDICATES_IS_JOINABLE = containsString(
            "You may join this game");
   private static final Matcher<String> INDICATES_HAS_JOINED = containsString(
            "You have joined this game");
   private static final Matcher<String> INDICATES_JOINING_NFORMATION = anyOf(
            INDICATES_HAS_JOINED, INDICATES_IS_JOINABLE,
            INDICATES_IS_NOT_JOINABLE);
   private static final Matcher<String> INDICATES_HAS_NO_PLAYERS = containsString(
            "This game has no players");

   private static final By SCENARIO_LINK_LOCATOR = By.id("scenario");
   private static final By RECRUITING_ELEMENT_LOCATOR = By.id("recruiting");
   private static final By PLAYERS_ELEMENT_LOCATOR = By.id("players");
   private static final By JOINABLE_ELEMENT_LOCATOR = By.id("joinable");
   private static final By END_RECRUITMENT_BUTTON_LOCATOR = By
            .id("end-recruitment");
   private static final By JOIN_BUTTON_LOCATOR = By.id("join");

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

   public void assertIndicatesGameHasNoPlayers() {
      final var element = assertHasElement(getBody(), PLAYERS_ELEMENT_LOCATOR);
      assertThat(element.getText(), INDICATES_HAS_NO_PLAYERS);
   }

   public void assertIndicatesIsNotRecruitingPlayers() {
      final var element = assertHasElement(getBody(),
               RECRUITING_ELEMENT_LOCATOR);
      assertThat(element.getText(), INDICATES_IS_NOT_RECRUITING_PLAYERS);
   }

   public void assertIndicatesIsRecruitingPlayers() {
      final var element = assertHasElement(getBody(),
               RECRUITING_ELEMENT_LOCATOR);
      assertThat(element.getText(), INDICATES_IS_RECRUITING_PLAYERS);
   }

   public void assertIndicatesUserMayJoinGame() {
      final var joinable = assertHasElement(getBody(),
               JOINABLE_ELEMENT_LOCATOR);
      assertThat("Indicates may join game", joinable.getText(),
               INDICATES_IS_JOINABLE);
   }

   public void assertIndicatesUserMayNotJoinGame() {
      final var element = assertHasElement(getBody(), JOINABLE_ELEMENT_LOCATOR);
      assertThat(element.getText(), INDICATES_IS_NOT_JOINABLE);
   }

   public void assertIndicatesWhetherRecruitingPlayers() {
      assertIndicatesWhetherRecruitingPlayers(getBody());
   }

   private void assertIndicatesWhetherRecruitingPlayers(final WebElement body)
            throws MultipleFailuresError {
      final var element = assertHasElement(body, RECRUITING_ELEMENT_LOCATOR);
      final var elementText = element.getText();
      assertAll(
               () -> assertThat("page text mentions recruiting", body.getText(),
                        INDICATES_WHETHER_RECRUITING_PLAYERS),
               () -> assertThat("Element text indicates something", elementText,
                        either(INDICATES_IS_RECRUITING_PLAYERS)
                                 .or(INDICATES_IS_NOT_RECRUITING_PLAYERS)));
   }

   public void assertIndicatesWhetherUserMayJoinGame() {
      assertIndicatesWhetherUserMayJoinGame(getBody());
   }

   private void assertIndicatesWhetherUserMayJoinGame(final WebElement body) {
      final var joinable = assertHasElement(body, JOINABLE_ELEMENT_LOCATOR);
      assertThat("Indicates whether the user may join this game",
               joinable.getText(), INDICATES_JOINING_NFORMATION);
   }

   public void assertListOfPlayersIncludes(final User user) {
      Objects.requireNonNull(user, "user");
      final var players = assertHasElement(getBody(), PLAYERS_ELEMENT_LOCATOR);
      final var playersList = assertHasElement(players, By.tagName("ul"));
      assertThat("Players list includes user", playersList.getText(),
               containsString(user.getUsername()));
   }

   public void assertListsPlayersOfGameOrReportsNoPlayers() {
      assertListsPlayersOfGameOrReportsNoPlayers(getBody());
   }

   private void assertListsPlayersOfGameOrReportsNoPlayers(
            final WebElement body) {
      assertHasElement("lists players or reports has no players", body,
               PLAYERS_ELEMENT_LOCATOR);
   }

   @Override
   protected void assertValidBody(@Nonnull final WebElement body) {
      assertAll(() -> assertIndicatesWhetherUserMayJoinGame(body),
               () -> assertListsPlayersOfGameOrReportsNoPlayers(body),
               () -> assertValidBodyText(body, body.getText()));
   }

   private void assertValidBodyText(final WebElement body,
            final String bodyText) throws MultipleFailuresError {
      final var universalConstraints = allOf(INDICATES_IS_A_GAME,
               INDICATES_WHETHER_RECRUITING_PLAYERS,
               INDICATES_JOINING_NFORMATION, includesScenarioTitile);
      final var optionalConstraints = includesCreationTime == null
               ? any(String.class)
               : includesCreationTime;
      final var textConstraints = both(universalConstraints)
               .and(optionalConstraints);
      assertAll(() -> assertThat("Body text", bodyText, textConstraints),
               () -> assertIndicatesWhetherRecruitingPlayers(body));
   }

   public void endRecruitement() {
      requireIsReady();
      final var button = getBody().findElement(END_RECRUITMENT_BUTTON_LOCATOR);
      if (!isEnabled(button)) {
         throw new IllegalStateException(
                  "Button [" + button + "] is not enabled");
      }
      button.click();
      awaitIsReady();
   }

   public int getNumberOfPlayersListed() {
      final var players = getBody().findElements(PLAYERS_ELEMENT_LOCATOR);
      if (players.isEmpty()) {
         return 0;
      } else {
         return players.get(0).findElements(By.tagName("li")).size();
      }
   }

   public boolean isEndRecruitmentEnabled() {
      requireIsReady();
      return isEnabled(getBody().findElement(END_RECRUITMENT_BUTTON_LOCATOR));
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

   public void joinGame() {
      requireIsReady();
      final var button = getBody().findElement(JOIN_BUTTON_LOCATOR);
      if (!isEnabled(button)) {
         throw new IllegalStateException(
                  "Button [" + button + "] is not enabled");
      }
      button.click();
      awaitIsReady();
   }

   public ScenarioPage navigateToScenarioPage() {
      requireIsReady();
      final var link = getBody().findElement(SCENARIO_LINK_LOCATOR);
      link.click();
      scenarioPage.awaitIsReady();
      return scenarioPage;
   }

   public void requireIndicatesIsRecruitingPlayers()
            throws IllegalStateException {
      final WebElement element;
      try {
         element = getBody().findElement(RECRUITING_ELEMENT_LOCATOR);
      } catch (final Exception e) {
         throw new IllegalStateException(
                  "Unable to find element that indicates whether recruiting",
                  e);
      }
      final var text = element.getText();
      if (!INDICATES_IS_RECRUITING_PLAYERS.matches(text)) {
         throw new IllegalStateException("Wrong text (" + text + ")");
      }
   }
}
