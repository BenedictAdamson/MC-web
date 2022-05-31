package uk.badamson.mc.presentation

import spock.lang.Specification
import spock.lang.Unroll

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
class ScenarioSpec extends Specification {

  def "List scenarios"() {
    when: "examine scenarios"
    then: "the response is a list of scenarios"
  }

  def "Examine scenario anonymously"() {
    given: "a scenario that has a game"
    and: "not logged in"
    when: "examine the scenario"
    then: "the scenario includes the scenario description"
    and: "the scenario includes the list of playable characters of that scenario"
    and: "the scenario includes the list of games of that scenario"
    and: "it does not allow examination of games of the scenario"
  }

  @Unroll
  def "Examine scenario with authorization"() {
    given: "a scenario that has a game"
    and: "user has the $role role"
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