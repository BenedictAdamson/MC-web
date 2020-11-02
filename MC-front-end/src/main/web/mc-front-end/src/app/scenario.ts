import { NamedUUID } from './named-uuid';

/**
 * <p>
 * A scenario of the Mission Command game.
 * </p>
 * <p>
 * This front-end class corresponds to the back-end class uk.badamson.mc.Scenario.
 * </p>
 */
export class Scenario {
	identifier: NamedUUID;
	description: string;
}
