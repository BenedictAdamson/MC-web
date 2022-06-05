package uk.badamson.mc.presentation


import org.testcontainers.spock.Testcontainers
import spock.lang.Unroll
import uk.badamson.mc.Game
import uk.badamson.mc.NamedUUID
import uk.badamson.mc.Scenario

import static org.hamcrest.Matchers.*
import static spock.util.matcher.HamcrestSupport.*

import java.time.Instant

/** © Copyright Benedict Adamson 2019,20,22.
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
 * The Mission Command game provides multiple scenarios that can be played.
 */
@Testcontainers
class ScenarioSpec extends MockedBeSpecification {

    private static final def SCENARIO_ID = UUID.randomUUID()
    private static final List<NamedUUID> CHARACTERS = List.of(new NamedUUID(UUID.randomUUID(), 'Squad leader'))
    private static final def SCENARIO_TITLE = 'Squad assault'
    private static final def SCENARIO = new Scenario(SCENARIO_ID, SCENARIO_TITLE, 'Basic fire and movement tactics', CHARACTERS)
    private static final def GAME_CREATION_TIME = Instant.parse('2022-05-31T20:00:00Z')
    private static final def GAME_ID = new Game.Identifier(SCENARIO_ID, GAME_CREATION_TIME)
    private static final def GAME = new Game(GAME_ID, Game.RunState.RUNNING)

    @Override
    protected final String getSpecificationName() {
        'ScenarioSpec'
    }

    def "List scenarios"() {
        when: "examine scenarios"
        world.backEnd.mockGetAllScenarios(Set.of(new NamedUUID(SCENARIO_ID, SCENARIO_TITLE)))
        world.getHomePage()
        world.navigateToScenariosPage()

        then: "the response is a list of scenarios"
        def scenariosPage = world.getAndAssertExpectedPage(ScenariosPage.class)
        scenariosPage.assertInvariants()
        scenariosPage.assertHasListOfScenarios()
        expect(scenariosPage.getScenarioTitles(), contains(SCENARIO_TITLE))
    }

    def "Examine scenario anonymously"() {
        given: "a scenario that has a game"
        world.backEnd.mockGetAllScenarios(Set.of(new NamedUUID(SCENARIO_ID, 'Squad assault')))
        world.backEnd.mockGetScenario(SCENARIO)
        world.backEnd.mockGetGameCreationTimes(SCENARIO_ID, Set.of(GAME_CREATION_TIME))
        world.backEnd.mockGetGame(GAME)
        world.backEnd.mockMayJoinGame(GAME_ID, false)

        and: "not logged in"
        world.notLoggedIn()

        when: "examine the scenario"
        world.navigateToScenariosPage()
        final def scenariosPage = world.getExpectedPage(ScenariosPage.class)
        final int index = 0
        world.setExpectedPage(scenariosPage.navigateToScenario(index))

        then: "the scenario includes the scenario description"
        def scenarioPage = world.getExpectedPage(ScenarioPage.class)
        scenarioPage.assertInvariants()
        //TODO test presence of description

        and: "the scenario includes the list of playable characters of that scenario"
        scenarioPage.assertHasListOfCharacters()

        and: "the scenario includes the list of games of that scenario"
        scenarioPage.assertHasListOfGames()

        and: "it does not allow examination of games of the scenario"
        !scenarioPage.hasLinksToGames()
    }

    @Unroll
    def "Examine scenario with authorization"() {
        given: "a scenario that has a game"
        and:
        "user has the $role role"
        and: "logged in"
        when: "examine the scenario"
        then: "the scenario includes the scenario description"
        and: "the scenario includes the list of playable characters of that scenario"
        and: "the scenario includes the list of games of that scenario"
        and: "it allows examination of games of the scenario"

        where:
        role << ['player', 'manage games']
    }
}