/**
 * <p>
 * A scenario of the Mission Command game.
 * </p>
 * <p>
 * This front-end class corresponds to the back-end class uk.badamson.mc.Scenario.Identifier,
 * not to the back-end class uk.badamson.mc.Scenario.
 * </p>
 */
export class Scenario {
	id: string; // Unique. Probably a UUID, but not required to be
	title: string;
	description: string;
}
