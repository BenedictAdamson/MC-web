import { Observable, ReplaySubject, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { User } from '../user';

/**
 * @description
 * Provide information about the current user,
 * and an interface for authentication (logging in).
 */
export abstract class AbstractSelfService {

	/**
	 * provides null if credentials unknown
	 */
	private userRS$: ReplaySubject<User | null> = new ReplaySubject(1);

	private authenticatedRS$: ReplaySubject<boolean> = new ReplaySubject(1);

	/**
	 * @description
	 * Initial state:
	 * * null [[username$]]
	 * * null [[password$]]
	 * * not [[authenticated$]]
	 *
	 * Instancing this class does not trigger a login request or any network traffic.
	 */
	constructor() {
		this.userRS$.next(null);
		this.authenticatedRS$.next(false);
	}

	/**
	 * @description
	 * The unique ID of the current user.
	 *
	 * null if the user ID is unknown,
	 * which includes the case that the user is not logged in.
	 */
	get id$(): Observable<string | null> {
		return this.userRS$.pipe(
			map(u => u ? u.id : null)
		);
	}

	/**
	 * @description
	 * The name of the current user.
	 *
	 * null if the user name is unknown,
	 * which includes the case that the user is not logged in.
	 */
	get username$(): Observable<string | null> {
		return this.userRS$.pipe(
			map(u => u ? u.username : null)
		);
	}

	/**
	 * @description
	 * The password of the current user.
	 *
	 * null if the correct password is unknown,
	 * which includes the case that the user is not logged in
	 * or if authentication has been tried but failed (which includes the case that the password is invalid).
	 */
	get password$(): Observable<string | null> {
		return this.userRS$.pipe(
			map(u => u ? u.password : null)
		);
	}

	private processResponse(password: string | null, details: User | null): boolean {
		var authenticated: boolean;
		if (details) {
			details = new User(details.id, details);
			details.password = password;
			authenticated = true;
		} else {
			authenticated = false;
		}
		this.setUser(details, authenticated);
		return authenticated;
	}


	/**
	 * @description
	 * Change the current authenticated user recorded locally.
	 *
	 * The method does not communicate with the server.
	 * It intended only for testing.
	 */
	setUser(user: User | null, authenticated: boolean) {
		this.userRS$.next(user);
		this.authenticatedRS$.next(authenticated);
	}

	/**
	 * @description
	 * Change the credentials of the current user.
	 *
	 * The method attempts authentication (login) of the user,
	 * providing a value indicating whether authentication was successful.
	 * That indirectly makes use of an HTTP request, which is a cold Observable,
	 * so this is a cold Observable too.
	 * That is, the expensive HTTP request will not be made until something subscribes to this Observable.
	 *
	 * Iff the authentication is successful, {@link authenticated$} will emit `true``.
	 * The authorities of the current user will be updated, if authentication is successful.
	 *
	 * The server may indicate that the user should use a different, canonical username,
	 * in which case the method sets the {@link username} attribute to that canonical username,
	 * rather than to the provided username.
	 *
	 * The method makes use of the `/api/self` endpoint of the server,
	 * to check that the username and password are valid,
	 * and to get the authorities of the user.
	 *
	 * @param username
	 * The name of the user to authenticate as, or `null` if attempting to resume a session.
	 *
	 * @param password
	 * The password of the user to authenticate as, or `null` if attempting to resume a session.
	 */
	authenticate(username: string | null, password: string | null): Observable<boolean> {
		return this.getUserDetails(username, password).pipe(
			map(ud => this.processResponse(password, ud))
		);
	}

	/**
	 * Clear the credentials of the current user.
	 *
	 * This also tells the server to end (clear) its session information,
	 * if the user is [[authenticated$]],
	 * by posting to the `/logout` end-point. This method therefore contacts the server.
	 * It returns an Observable that indicates when communication with the server has completed.
	 *
	 * On completion of the returned Observable, the #username and #password of this service are null,
	 * and the current user has no authorisation.
	 */
	logout(): Observable<null> {
		return this.postLogout().pipe(
			mergeMap(() => {
				this.clear();
				return of(null);
			}
			));
	}


	/**
	 * @description
	 * If the authentication system maintains session information on the server,
	 * update the authentication information (the credentials of the current user)
	 * to be the information of the current session.
	 *
	 * The method provides a value indicating whether authentication has finished.
	 * It indirectly makes use of an HTTP request, which is a cold Observable,
	 * so this is a cold Observable too.
	 * That is, the expensive HTTP request will not be made until something subscribes to this Observable.
	 *
	 * The method updates the `username$`, `password$`, `authenticated$`  and `authorities$` Observables.
	 *
	 * The method makes use of the `/api/self` endpoint of the server,
	 * to get the current user details.
	 */
	checkForCurrentAuthentication(): Observable<null> {
		return this.authenticate(null, null).pipe(
			map(() => null)
		);
	}

	private clear(): void {
		this.userRS$.next(null);
		this.authenticatedRS$.next(false);
	}

	/**
	 * @description
	 * Whether the current user is authenticated (logged in).
	 *
	 * Not authenticated if {@link username} is null.
	 * Can be authenticated with a null {@link password},
	 * if the user has not (recently) provided a password, but the system was able to resume a session.
	 */
	get authenticated$(): Observable<boolean> {
		return this.authenticatedRS$.asObservable();
	}

	/**
	 * @description
	 * The authorities (authorised roles) of the current user.
	 *
	 * These values are for role based access control (RBAC).
	 * A user that has not been authenticated has no authorities.
	 * An authenticated user could have no authorities, although that is unlikely in practice. 
	 */
	private get authorities$(): Observable<string[]> {
		return this.userRS$.pipe(
			map(u => u ? u.authorities : [])
		);
	}

	private hasRole$(role: string): Observable<boolean> {
		return this.authorities$.pipe(
			map(authorities => authorities.includes(role))
		);
	}

	/**
	 * @description
	 * Whether the current user is authorised to manage games.
	 *
	 * A user that has not been authenticated is not authorised to manage games.
	 * The current user must have `ROLE_MANAGE_GAMES` as one of its authorities
	 * to be authorised to manage games.
	 */
	get mayManageGames$(): Observable<boolean> {
		return this.hasRole$('ROLE_MANAGE_GAMES');
	}

	/**
	 * @description
	 * Whether the current user is authorised to play games.
	 *
	 * A user that has not been authenticated is not authorised to play games.
	 * The current user must have `ROLE_PLAYER` as one of its authorities
	 * to be authorised to play games.
	 */
	get mayPlay$(): Observable<boolean> {
		return this.hasRole$('ROLE_PLAYER');
	}

	/**
	 * @description
	 * Whether the current user is authorised to manage users.
	 *
	 * A user that has not been authenticated is not authorised to manage users.
	 * The current user must have `ROLE_MANAGE_USERS` as one of its authorities
	 * to be authorised to manage users.
	 */
	get mayManageUsers$(): Observable<boolean> {
		return this.hasRole$('ROLE_MANAGE_USERS');
	}

	/**
	 * @description
	 * Whether the current user is authorised to list users.
	 *
	 * A user that has not been authenticated is not authorised to list users.
	 * The current user must have `ROLE_MANAGE_USERS` or `ROLE_PLAYER` as one of its authorities
	 * to be authorised to manage users.
	 */
	get mayListUsers$(): Observable<boolean> {
		return this.authorities$.pipe(
			map(
				authorities => authorities.includes('ROLE_PLAYER') || authorities.includes('ROLE_MANAGE_USERS')
			)
		);
	}

	protected abstract getUserDetails(username: string | null, password: string | null): Observable<User | null>;

	protected abstract postLogout(): Observable<null>;
}
