package uk.badamson.mc;
/*
 * © Copyright Benedict Adamson 2020-21.
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
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.util.Objects;

import javax.annotation.Nonnull;

import org.opentest4j.MultipleFailuresError;
import org.springframework.beans.factory.annotation.Autowired;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import uk.badamson.mc.presentation.GamePage;
import uk.badamson.mc.presentation.HomePage;
import uk.badamson.mc.presentation.ScenarioPage;

/**
 * <p>
 * Definitions of BDD steps, for features about games.
 * </p>
 */
public class GameSteps extends Steps {

   private int gameIndex;

   private int nGames0;

   private String gamePagePath;

   @Autowired
   public GameSteps(@Nonnull final World world) {
      super(world);
   }

   private void assertIsOkGamePage() throws MultipleFailuresError {
      final var gamePage = world.getAndAssertExpectedPage(GamePage.class);
      assertAll("valid game page", () -> gamePage.assertInvariants(),
               () -> gamePage.assertNoErrorMessages());
   }

   @Then("can get the list of games")
   public void can_get_list_of_games() {
      final var scenarioPage = world.getExpectedPage(GamePage.class)
               .navigateToScenarioPage();
      scenarioPage.assertHasListOfGames();
      world.setExpectedPage(scenarioPage);
   }

   @When("creating a game")
   public void creating_game() {
      final var scenarioPage = world.getExpectedPage(ScenarioPage.class);
      nGames0 = scenarioPage.getNumberOfGamesListed();
      world.setExpectedPage(scenarioPage.createGame());
   }

   @When("examine whether have a current game")
   public void examine_whether_have_current_game() {
      world.getHomePage();
   }

   @Given("examining a game recruiting players")
   public void examining_game_recruiting_players() {
      /*
       * Must create the game before navigating to the scenario page, otherwise
       * the page will not include it, because the front-end has no means for
       * knowing that a change has been made on the back-end.
       */
      final var scenario = world.getScenarios().findFirst().get().getId();
      final var scenarioIndex = 0;
      world.createGame(scenario);

      final var scenarioPage = world.getHomePage().navigateToScenariosPage()
               .navigateToScenario(scenarioIndex);
      world.setExpectedPage(scenarioPage);
      nGames0 = scenarioPage.getNumberOfGamesListed();
      final var gamePage = scenarioPage.navigateToGamePage(nGames0 - 1);
      gamePage.requireIndicatesIsRecruitingPlayers();
      world.setExpectedPage(gamePage);
   }

   @Then("the game page does not indicate which characters are played by which \\(other) users")
   public void game_page_does_not_indicate_which_characters_are_played_by_other_users() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertDoesNotIndicateWhichCharactersPlayedByOtherUsers();
   }

   @Then("the game page includes the scenario description")
   public void game_page_includes_scenario_description() {
      // hard to test
   }

   @Then("the game page includes the scenario title")
   public void game_page_includes_scenario_title() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIncludesScenarioTitle();
   }

   @Then("the game page includes the date and time that the game was set up")
   public void game_page_includes_time_set_up() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIncludesCreationTime();
   }

   @Then("the game page indicates that the current game is the game joined")
   public void game_page_indicates_current_game_is_game_joined() {
      assertThat("Current URL Path is the path of the game joined",
               world.getCurrentUrlPath(), is(gamePagePath));
   }

   @Then("the game page indicates that the game has no players")
   public void game_page_indicates_game_has_no_players() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIndicatesGameHasNoPlayedCharacters();
   }

   @Then("the game page indicates that the game is not recruiting players")
   public void game_page_indicates_game_not_recuiting_players() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIndicatesIsNotRecruitingPlayers();
   }

   @Then("the game page indicates that the game is recruiting players")
   public void game_page_indicates_that_game_recuiring_players() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIndicatesIsRecruitingPlayers();
   }

   @Then("the game page indicates that the user is not playing the game")
   public void game_page_indicates_user_is_not_playing_game() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIndicatesUserIsNotPlayingGame();
   }

   @Then("the game page indicates that the user is playing the game")
   public void game_page_indicates_user_is_playing_game() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIndicatesUserIsPlayingGame();
   }

   @Then("the game page indicates that the user may join the game")
   public void game_page_indicates_user_may_join_game() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIndicatesUserMayJoinGame();
   }

   @Then("the game page indicates that the user may not join the game")
   public void game_page_indicates_user_may_not_join_game() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIndicatesUserMayNotJoinGame();
   }

   @Then("the game page indicates whether the game has players")
   public void game_page_indicates_whether_game_has_players() {
      final var gamePage = world.getAndAssertExpectedPage(GamePage.class);
      gamePage.assertIndicatesWhetherGameHasPlayers();
   }

   @Then("the game page indicates whether the game is recruiting players")
   public void game_page_indicates_whether_game_recuiting_players() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIndicatesWhetherRecruitingPlayers();
   }

   @Then("the game page indicates whether the user is playing the game")
   public void game_page_indicates_whether_user_is_playing_game() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIndicatesWhetherUserIsPlayingGame();
   }

   @Then("the game page indicates whether the user may join the game")
   public void game_page_indicates_whether_user_may_join_game() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIndicatesWhetherUserMayJoinGame();
   }

   @Then("the game page indicates which character \\(if any) the user is playing")
   public void game_page_indicates_which_character_user_is_playing() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIndicatesWhichCharacterIfAnyUserIsPlaying();
   }

   @Then("the game page indicates which characters are played by which users")
   public void game_page_indicates_which_characters_are_played_by_which_users() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIndicatesWhichCharactersPlayedByWhichUsers();
   }

   @Then("the list of games includes the new game")
   public void list_of_games_includes_new_game() {
      final var nGames = world.getExpectedPage(ScenarioPage.class)
               .getNumberOfGamesListed();
      assertEquals(nGames0 + 1, nGames, "Added a game to the list of games");
   }

   @Then("MC accepts the creation of the game")
   public void mc_accepts_creation_of_game() {
      assertIsOkGamePage();
   }

   @Then("MC accepts ending recruitment for the game")
   public void mc_accepts_ending_recuitment_for_game() {
      assertIsOkGamePage();
   }

   @Then("MC accepts joining the game")
   public void mc_accepts_joining_game() {
      assertIsOkGamePage();
   }

   @Then("MC does not allow creating a game")
   public void mc_does_not_allow_creating_a_game() {
      final var scenarioPage = world.getExpectedPage(ScenarioPage.class);
      assertFalse(scenarioPage.isGameButtonEnabled());
   }

   @Then("MC does not allow ending recruitment for the game")
   public void mc_does_not_allow_ending_recuitement_for_game() {
      final var gamePage = world.getAndAssertExpectedPage(GamePage.class);
      assertFalse(gamePage.isEndRecruitmentEnabled());
   }

   @Then("it provides a game")
   public void provides_game() {
      world.getAndAssertExpectedPage(GamePage.class).assertInvariants();
   }

   @When("examine the current-game")
   public void examine_current_game() {
      world.setExpectedPage(world.getHomePage().navigateToCurrentGamePage());
   }

   @When("navigate to one game page")
   public void navigate_to_one_game_page() {
      final var scenarioPage = world.getExpectedPage(ScenarioPage.class);
      gameIndex = 0;
      world.setExpectedPage(scenarioPage.navigateToGamePage(gameIndex));
   }

   @When("it does not indicate that the user has a current game")
   public void oes_not_indicate_user_has_current_game() {
      assertThat(world.getAndAssertExpectedPage(HomePage.class)
               .doesIndicateUserHasCurrentGame(), is(false));
   }

   @When("user ends recruitment for the game")
   public void user_ends_recuitement_for_game() {
      world.getExpectedPage(GamePage.class).endRecruitement();
   }

   @When("the user joins the game")
   public void user_joins_game() {
      final var gamePage = world.getExpectedPage(GamePage.class);
      gamePagePath = world.getCurrentUrlPath();
      gamePage.joinGame();
   }

   @Given("user is not playing any games")
   public void user_not_playing_games() {
      /* Create each test user afresh, so this is guaranteed to be true. */
      Objects.requireNonNull(world.getLoggedInUser(), "loggedInUser");
   }

   @Given("user is playing a game")
   public void user_playing_game() {
      final var scenario = world.getScenarios().findFirst().get().getId();
      final var gameId = world.createGame(scenario);
      world.joinGame(gameId);
   }

   @Given("viewing a game that is recruiting players")
   public void viewing_game_recuiting_players() {
      final var scenario = world.getScenarios().map(namedId -> namedId.getId())
               .findFirst().get();
      final var scenarioIndex = 0;
      world.createGame(scenario);
      nGames0 = (int) world.getGameCreationTimes(scenario).count();

      final var scenarioPage = world.getHomePage().navigateToScenariosPage()
               .navigateToScenario(scenarioIndex);
      world.setExpectedPage(scenarioPage);
      final var gamePage = scenarioPage.navigateToGamePage(nGames0 - 1);
      gamePage.requireIsReady();
      gamePage.requireIndicatesIsRecruitingPlayers();
      world.setExpectedPage(gamePage);
   }
}
