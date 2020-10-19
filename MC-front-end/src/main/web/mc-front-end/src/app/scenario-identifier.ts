/**
 * <p>
 * An identifier for a scenario of the Mission Command game.
 * </p>
 * <p>
 * This front-end class corresponds to the back-end class uk.badamson.mc.Scenario.Identifier.
 * </p>
 */
export class ScenarioIdentifier {
	id: string; // Unique. Probably a UUID, but not required to be
	title: string;
}
