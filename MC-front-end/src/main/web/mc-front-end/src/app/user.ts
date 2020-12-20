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

	id: string;// typically a UUID

	constructor(id: string, userDetails: UserDetails) {
		super(userDetails);
		this.id = id;
	}
}
