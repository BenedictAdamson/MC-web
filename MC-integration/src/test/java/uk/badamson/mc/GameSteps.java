package uk.badamson.mc;
/*
 * © Copyright Benedict Adamson 2020.
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

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import javax.annotation.Nonnull;

import org.springframework.beans.factory.annotation.Autowired;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import uk.badamson.mc.presentation.GamePage;
import uk.badamson.mc.presentation.ScenarioPage;

/**
 * <p>
 * Definitions of BDD steps, for features about games.
 * </p>
 */
public class GameSteps extends Steps {

   private int scenarioIndex;

   private int gameIndex;

   private int nGames0;

   private Game.Identifier identifier;

   @Autowired
   public GameSteps(@Nonnull final World world) {
      super(world);
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
      scenarioIndex = 0;
      final var scenarioPage = navigateToScenario();
      nGames0 = scenarioPage.getNumberOfGamesListed();
      world.setExpectedPage(scenarioPage.createGame());
   }

   @Then("The game page includes the scenario description")
   public void game_page_includes_scenario_description() {
      // hard to test
   }

   @Then("The game page includes the scenario title")
   public void game_page_includes_scenario_title() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIncludesScenarioTitle();
   }

   @Then("The game page includes the date and time that the game was set up")
   public void game_page_includes_time_set_up() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIncludesCreationTime();
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

   @Then("The game page indicates whether the game is recruiting players")
   public void game_page_indicates_whether_game_recuiting_players() {
      world.getAndAssertExpectedPage(GamePage.class)
               .assertIndicatesWhetherRecruitingPlayers();
   }

   @Then("the list of games includes the new game")
   public void list_of_games_includes_new_game() {
      final var nGames = world.getExpectedPage(ScenarioPage.class)
               .getNumberOfGamesListed();
      assertEquals(nGames0 + 1, nGames, "Added a game to the list of games");
   }

   @Then("MC accepts the creation of the game")
   public void mc_accepts_creation_of_game() {
      world.getAndAssertExpectedPage(GamePage.class).assertInvariants();
   }

   @Then("MC accepts ending recruitment for the game")
   public void mc_accepts_ending_recuitment_for_game() {
      final var gamePage = world.getAndAssertExpectedPage(GamePage.class);
      assertAll(() -> gamePage.assertInvariants(),
               () -> gamePage.assertNoErrorMessages());
   }

   @Then("MC does not present creating a game as an option")
   public void mc_does_not_present_creating_game_option() {
      final var scenarioPage = navigateToScenario();
      assertFalse(scenarioPage.hasCreateGameButton());
   }

   @Then("MC does not present ending recruitment for the game as an option")
   public void mc_does_not_present_ending_recuitement_for_game_as_option() {
      final var gamePage = world.getAndAssertExpectedPage(GamePage.class);
      assertFalse(gamePage.hasEndRecruitmentOption());
   }

   @Then("MC serves the game page")
   public void mc_serves_game_page() {
      world.getAndAssertExpectedPage(GamePage.class).assertInvariants();
   }

   @When("Navigate to one game of the scenario")
   public void navigate_to_game_of_scenario() {
      final var scenarioPage = world.getExpectedPage(ScenarioPage.class);
      gameIndex = 0;
      world.setExpectedPage(scenarioPage.navigateToGamePage(gameIndex));
   }

   private ScenarioPage navigateToScenario() {
      final var scenarioPage = world.getHomePage().navigateToScenariosPage()
               .navigateToScenario(scenarioIndex);
      world.setExpectedPage(scenarioPage);
      return scenarioPage;
   }

   @When("A scenario has games")
   public void scenario_has_games() {
      final var scenario = world.getScenarios().findFirst().get().getId();
      scenarioIndex = 0;
      identifier = world.createGame(scenario);
   }

   @When("user ends recruitment for the game")
   public void user_ends_recuitement_for_game() {
      world.getExpectedPage(GamePage.class).endRecruitement();
   }

   @Given("viewing a game that is recruiting players")
   public void viewing_game_recuiting_players() {
      scenarioIndex = 0;
      final var scenario = world.getScenarios().map(namedId -> namedId.getId())
               .findFirst().get();
      world.createGame(scenario);
      nGames0 = (int) world.getGameCreationTimes(scenario).count();
      final var scenarioPage = navigateToScenario();
      final var gamePage = scenarioPage.navigateToGamePage(nGames0 - 1);
      gamePage.requireIsReady();
      gamePage.requireIndicatesIsRecruitingPlayers();
      world.setExpectedPage(gamePage);
   }

   @When("Viewing the games of the scenario")
   public void viewing_games_of_scenario() {
      navigateToScenario().requireIsReady();
   }
}
