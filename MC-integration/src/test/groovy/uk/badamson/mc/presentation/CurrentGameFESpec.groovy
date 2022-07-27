package uk.badamson.mc.presentation

import uk.badamson.mc.Authority
import uk.badamson.mc.Game
import uk.badamson.mc.NamedUUID
import uk.badamson.mc.Scenario

import java.time.Instant
/**
 * © Copyright Benedict Adamson 2021-22.
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

/**
 * The system provides information about the game that a player is currently playing
 */
class CurrentGameFESpec extends MockedBeSpecification {

  private static final def SCENARIO_ID = UUID.randomUUID()
  private static final def CHARACTER_ID = UUID.randomUUID()
  private static final List<NamedUUID> CHARACTERS = List.of(new NamedUUID(CHARACTER_ID, 'Squad leader'))
  private static final def SCENARIO_TITLE = 'Squad assault'
  private static final def SCENARIO = new Scenario(SCENARIO_ID, SCENARIO_TITLE, 'Basic fire and movement tactics', CHARACTERS)
  private static final def GAME_CREATION_TIME = Instant.parse('2022-05-31T20:00:00Z')
  private static final def GAME_ID = new Game.Identifier(SCENARIO_ID, GAME_CREATION_TIME)
  private static final def GAME_WAITING_TO_START =
          new Game(GAME_ID, Game.RunState.WAITING_TO_START, true, Map.of())

  @Override
  protected String getSpecificationName() {
    'CurrentGameFESpec'
  }

  def "May examine current-game only if playing"() {
    given: "has a game"
    hasAGame()

    and: "user is not playing any games"
    world.backEnd.mockNoCurrentGame()

    when: "logged in as a user with the player role"
    def homePage = world.logInAsUserWithTheRole(Authority.ROLE_PLAYER)

    then: "does not indicate that the user has a current game"
    !homePage.doesIndicateUserHasCurrentGame()
  }

  def "Examine current game"() {
    given: "has a game that the user is playing"
    world.backEnd.mockGetAllScenarios(Set.of(new NamedUUID(SCENARIO_ID, SCENARIO_TITLE)))
    world.backEnd.mockGetScenario(SCENARIO)
    def user = world.createUserWithRole(Authority.ROLE_PLAYER)
    def game = new Game(GAME_ID, Game.RunState.WAITING_TO_START, true, Map.of(CHARACTER_ID, user.id))
    world.backEnd.mockGetGameCreationTimes(SCENARIO_ID, Set.of(GAME_ID.created))
    world.backEnd.mockGetGame(GAME_ID, game)
    world.backEnd.mockCurrentGame(GAME_ID)

    when: "logged in as a user with the player role"
    def homePage = world.logInAsUser(user)

    then: "indicates that the user has a current game"
    homePage.doesIndicateUserHasCurrentGame()

    when: "examine the current game"
    def gamePage = homePage.navigateToCurrentGamePage()

    then: "the game indicates which character the user is playing"
    gamePage.assertInvariants()
    gamePage.assertIndicatesWhichCharacterUserIsPlaying()
  }

  private void hasAGame() {
    world.backEnd.mockGetAllScenarios(Set.of(new NamedUUID(SCENARIO_ID, SCENARIO_TITLE)))
    world.backEnd.mockGetScenario(SCENARIO)
    world.backEnd.mockGetGameCreationTimes(SCENARIO_ID, Set.of(GAME_CREATION_TIME))
    world.backEnd.mockGetGame(GAME_ID, GAME_WAITING_TO_START)
  }


}
