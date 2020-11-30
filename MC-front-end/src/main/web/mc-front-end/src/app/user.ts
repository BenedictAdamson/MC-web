import { v4 as uuid } from 'uuid';

import { UserDetails } from './user-details';

/**
 * <p>
 * A user of the Mission Command game.
 * </p>
 * <p>
 * This front-end class corresponds to the back-end class uk.badamson.mc.User.
 * </p>
 */
export class User extends UserDetails {
	
	id: uuid;

	constructor(id: uuid, userDetails: UserDetails) {
		super(userDetails);
		this.id = id;
	}
}
