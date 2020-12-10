import { v4 as uuid } from 'uuid';
import { GameIdentifier } from './game-identifier'

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
	identifier: GameIdentifier;
	recruiting: boolean;
	users: uuid[];
}
