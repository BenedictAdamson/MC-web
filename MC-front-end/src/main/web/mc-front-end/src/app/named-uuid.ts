import { v4 as uuid } from 'uuid';

/**
 * <p>
 * A UUID associated with a human-readable title or name.
 * </p>
 * <p>
 * This front-end class corresponds to the back-end class uk.badamson.mc.NamedUUID.
 * </p>
 */
export class NamedUUID {
	id: uuid;
	title: string;
}
