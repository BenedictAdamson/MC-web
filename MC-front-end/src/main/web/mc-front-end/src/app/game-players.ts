import { GameIdentifier } from './game-identifier';

/**
 * <p>
 * A game (play) of a scenario of the Mission Command game.
 * The set of users who played, or are playing, a particular
 * game.
 * </p>
 * <p>
 * This front-end class corresponds to the back-end class uk.badamson.mc.GamePlayers.
 * </p>
 */
export class GamePlayers {
	constructor(
		public game: GameIdentifier,
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
	) { }

	isPlaying(user: string): boolean {
		for (const u of this.users.values()) {
			if (user === u) {
				return true;
			}
		}
		return false;
	}
}
