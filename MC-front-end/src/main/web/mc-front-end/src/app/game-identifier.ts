import { v4 as uuid } from 'uuid';

/**
 * <p>
 * The unique identifier of a game.
 * </p>
 * <p>
 * This front-end class corresponds to the back-end class uk.badamson.mc.Game.Identifier.
 * </p>
 */
export class GameIdentifier {
	scenario: uuid;
	created: string;// a timestamp, in some format
}
