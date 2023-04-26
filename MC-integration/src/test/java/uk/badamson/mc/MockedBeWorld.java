package uk.badamson.mc;

import uk.badamson.mc.presentation.HomePage;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.nio.file.Path;
import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;

public final class MockedBeWorld extends BaseWorld {

    private final MockedBeContainers containers;

    public MockedBeWorld(@Nullable final Path failureRecordingDirectory) {
        super(failureRecordingDirectory);
        containers = new MockedBeContainers(failureRecordingDirectory);
    }

    public MockedBeWorld() {
        this(DEFAULT_FAILURE_RECORDING_DIRECTORY);
    }

    public MockMcBackEndContainer getBackEnd() {
        return containers.getBackEnd();
    }

    public void notLoggedIn() {
        getBackEnd().mockGetSelfUnauthenticated();
    }

    public HomePage logInAsUserWithTheRole(final Authority role) {
        return logInAsUser(createUser(EnumSet.of(role)));
    }

    public HomePage logInAsUserWithoutTheRole(final Authority role) {
        final Set<Authority> roles = EnumSet.complementOf(EnumSet.of(role));
        return logInAsUser(createUser(roles));
    }

    public HomePage logInAsUser(final User user) {
        getBackEnd().mockLogin(user, UUID.randomUUID().toString(), UUID.randomUUID().toString());
        getBackEnd().mockGetSelf(user);
        HomePage homePage = getHomePage();
        homePage.awaitIsReady();
        return homePage;
    }

    @Nonnull
    @Override
    public MockedBeContainers getContainers() {
        return containers;
    }

    @Nonnull
    @Override
    protected UUID addUser(@Nonnull BasicUserDetails userDetails) {
        return UUID.randomUUID();
    }
}
