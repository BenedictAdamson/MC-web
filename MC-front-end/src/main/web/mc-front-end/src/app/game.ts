import { GameIdentifier } from './game-identifier';

/**
 * <p>
 * A game (play) of a scenario of the Mission Command game.
 * </p>
 * <p>
 * This front-end class corresponds to the back-end class uk.badamson.mc.Game.
 * </p>
 */
export class Game {
	identifier: GameIdentifier;
   runState: string;
}
