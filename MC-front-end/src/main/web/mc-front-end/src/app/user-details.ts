/**
 * <p>
 * The details of a user of the Mission Command game.
 * </p>
 * <p>
 * This front-end class corresponds to the back-end class uk.badamson.mc.BasicUserDetails,
 * and to the Spring interface org.springframework.security.core.userdetails.UserDetails.
 * </p>
 */
export class UserDetails {
	username: string;// a unique ID
	password: string | null;// often null, indicating that the password is hidden or unknown
	authorities: string[];

	constructor(userDetails: UserDetails)
	{
		this.username = userDetails.username;
		this.password = userDetails.password;
		this.authorities = userDetails.authorities;
	}
}
