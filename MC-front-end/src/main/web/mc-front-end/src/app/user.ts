/**
 * <p>
 * A user of the Mission Command game.
 * </p>
 * <p>
 * This front-end class corresponds to the back-end class uk.badamson.mc.User.
 * </p>
 */
export class User {
    username: string;
    password: string; // often null
    authorities: string[];
}
