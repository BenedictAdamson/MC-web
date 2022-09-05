import {GameIdentifier} from './game-identifier';

/**
 * <p>
 * A game (play) of a scenario of the Mission Command game.
 * </p>
 * <p>
 * This front-end class corresponds to the back-end class uk.badamson.mc.Game.
 * </p>
 */
export class Game {
  constructor(
    public identifier: string,
    public scenario: string,
    public created: string,
    public runState: string,
    public recruiting: boolean,
    /**
     * <p>
     * The (unique IDs of the users
     * who played, or are playing, the game, and the IDs
     * of the characters they played.
     * </p>
     * <ul>
     * <li>The map maps a character ID to the ID of the user who is playing (or
     * played, or will play) that character.</li>
     * </ul>
     */
    public users: Map<string, string>
  ) {
  }

  characterOfUser(user: string): string | null {
    for (const e of this.users.entries()) {
      if (user === e[1]) {
        return e[0];
      }
    }
    return null;
  }

  isPlaying(user: string): boolean {
    return this.characterOfUser(user) != null;
  }
}
