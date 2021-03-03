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
	game: GameIdentifier;
	recruiting: boolean;
	users: string[];
}
