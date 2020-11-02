import { v4 as uuid } from 'uuid';

/**
 * <p>
 * A scenario of the Mission Command game.
 * </p>
 * <p>
 * This front-end class corresponds to the back-end class uk.badamson.mc.Scenario.
 * </p>
 */
export class Scenario {
	identifier: uuid;
	title: string;
	description: string;
}
