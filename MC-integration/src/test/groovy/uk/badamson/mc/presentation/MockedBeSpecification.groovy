package uk.badamson.mc.presentation

import org.testcontainers.lifecycle.TestDescription
import org.testcontainers.spock.Testcontainers
import spock.lang.Shared
import spock.lang.Specification
import uk.badamson.mc.MockedBeWorld

/**
 * © Copyright Benedict Adamson 2019-23.
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

@Testcontainers
abstract class MockedBeSpecification extends Specification {

    private static int testIndex = 0

    private TestDescription description = new TestDescription() {
        @Override
        String getTestId() {
            getSpecificationName() + '-' + testIndex
        }

        @Override
        String getFilesystemFriendlyName() {
            getTestId()
        }
    }

    @Shared
    protected final MockedBeWorld world = new MockedBeWorld()

    void setupSpec() {
        testIndex = 0
        world.start()
    }

    void setup() {
        ++testIndex
        world.beforeTest(description)
    }

    void cleanup() {
        world.afterTest(description, Optional.empty())
    }

    void cleanupSpec() {
        world.stop()
        world.close()
    }

    protected abstract String getSpecificationName()
}