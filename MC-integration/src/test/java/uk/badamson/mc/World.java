package uk.badamson.mc;
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

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.nio.file.Path;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

public final class World extends BaseWorld {

    private final McContainers containers;

    public World(@Nullable final Path failureRecordingDirectory) {
        super(failureRecordingDirectory);
        containers = new McContainers(failureRecordingDirectory);
    }

    private static <TYPE> boolean intersects(final Set<TYPE> set1,
                                             final Set<TYPE> set2) {
        /* The sets intersect if we can find any element in both. */
        return set1.stream().anyMatch(set2::contains);
    }

    public UUID createGame(final UUID scenario) {
        return createBackEndClient().createGame(scenario);
    }

    @Nonnull
    private McBackEndClient createBackEndClient() {
        return containers.getBackEnd().createClient();
    }

    @Override
    @Nonnull
    protected UUID addUser(@Nonnull final BasicUserDetails userDetails) {
        return createBackEndClient().addUser(userDetails);
    }

    public User createUserWithRoles(final Set<Authority> included,
                                    final Set<Authority> excluded) {
        Objects.requireNonNull(included, "included");
        Objects.requireNonNull(excluded, "excluded");
        if (intersects(included, excluded)) {
            throw new IllegalArgumentException("Contradictory role constraints");
        }

        return createUser(included);
    }

    public User currentUserIsUnknownUser() {
        return new User(UUID.randomUUID(), generateBasicUserDetails(Authority.ALL));
    }


    @Nonnull
    public Stream<NamedUUID> getScenarios() {
        return createBackEndClient().getScenarios();
    }

    @Nonnull
    @Override
    public McContainers getContainers() {
        return containers;
    }

}