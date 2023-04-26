package uk.badamson.mc.presentation;
/*
 * © Copyright Benedict Adamson 2020-23.
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

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import uk.badamson.mc.Fixtures;
import uk.badamson.mc.rest.NamedUUID;
import uk.badamson.mc.rest.Paths;
import uk.badamson.mc.rest.ScenarioResponse;
import uk.badamson.mc.service.ScenarioSpringService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static java.util.stream.Collectors.toUnmodifiableSet;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@DirtiesContext(classMode = ClassMode.AFTER_EACH_TEST_METHOD)
@Testcontainers
public class ScenarioRESTTest {

    @Container
    static MongoDBContainer mongoDBContainer = new MongoDBContainer(Fixtures.MONGO_DB_IMAGE);

    @DynamicPropertySource
    static void setProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri", mongoDBContainer::getReplicaSetUrl);
    }

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ScenarioSpringService service;
    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Tests {@link ScenarioController#getAll()}
     */
    @Test
    public void getAll() throws Exception {
        final var request = get("/api/scenario")
                .accept(MediaType.APPLICATION_JSON);

        final var response = mockMvc.perform(request);

        response.andExpect(status().isOk());
        final var jsonResponse = response.andReturn().getResponse()
                .getContentAsString();
        objectMapper.readValue(jsonResponse,
                new TypeReference<List<NamedUUID>>() {
                });
    }

    private UUID getKnownScenarioId() {
        final Optional<UUID> idOptional = service.getScenarioIdentifiers().findAny();
        assert idOptional.isPresent();
        return idOptional.get();
    }

    private UUID createUnknownScenarioId() {
        final var ids = service.getScenarioIdentifiers()
                .collect(toUnmodifiableSet());
        var id = UUID.randomUUID();
        while (ids.contains(id)) {
            id = UUID.randomUUID();
        }
        return id;
    }

    /**
     * Tests {@link ScenarioController#getScenario(UUID)}
     */
    @Nested
    public class GetScenario {

        @Test
        public void absent() throws Exception {
            final var id = createUnknownScenarioId();

            final var response = getScenario(id);

            response.andExpect(status().isNotFound());
        }

        private ResultActions getScenario(final UUID id) throws Exception {
            final var path = Paths.createPathForScenario(id);
            final var request = get(path).accept(MediaType.APPLICATION_JSON);

            return mockMvc.perform(request);
        }

        @Test
        public void present() throws Exception {
            final var id = getKnownScenarioId();

            final var response = getScenario(id);

            response.andExpect(status().isOk());
            final var jsonResponse = response.andReturn().getResponse()
                    .getContentAsString();
            final var scenarioResponse = objectMapper.readValue(jsonResponse, ScenarioResponse.class);
            assertThat(scenarioResponse.identifier(), is(id));
        }

    }

}
