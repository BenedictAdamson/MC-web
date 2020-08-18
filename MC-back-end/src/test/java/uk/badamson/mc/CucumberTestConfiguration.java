package uk.badamson.mc;
/*
 * © Copyright Benedict Adamson 2018-20.
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

import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.context.annotation.Import;

import io.cucumber.spring.CucumberContextConfiguration;

/**
 * <p>
 * The Spring Cucumber configuration for tests of the Mission Command game.
 * </p>
 */
@CucumberContextConfiguration
@Import(value = { TestConfiguration.class, CucumberBeansConfiguration.class })
@AutoConfigureWebTestClient
public class CucumberTestConfiguration {
}
