import { Observable, ReplaySubject, defer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { flatMap, map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { User } from '../user';

const selfUrl: string = '/api/self';
const logoutUrl: string = '/logout';

/**
 * @description
 * Provide information about the current user,
 * and an interface for authentication (logging in).
 */
@Injectable({
	providedIn: 'root'
})
export class SelfService {

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
	constructor(
		private http: HttpClient
	) {
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
	get id$(): Observable<uuid | null> {
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
     * The current user name can be known even if that user has not been authenticated.
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
     * null if the password is unknown,
     * which includes the case that the user is not logged in.
     * The current password name can be known even if that user has not been authenticated,
     * or if authentication has been tried but failed (which includes the case that the password is invalid).
     */
	get password$(): Observable<string | null> {
		return this.userRS$.pipe(
			map(u => u ? u.password : null)
		);
	}

	private handleUserDetailsHttpError() {
		return (error: any): Observable<User | null> => {
			// Do not log errors, all are equivalent to authentication failure.
			return of(null);
		};
	}

	private static createHeaders(username: string | null, password: string | null): HttpHeaders {
		var headers: HttpHeaders = new HttpHeaders();
		headers = headers.set('X-Requested-With', 'XMLHttpRequest');
		if (username && password) {
			headers = headers.set('Authorization', 'Basic ' + btoa(username + ':' + password));
		}
		return headers;
	}

	private getUserDetails(username: string | null, password: string | null): Observable<User | null> {
		const headers: HttpHeaders = SelfService.createHeaders(username, password);

		return this.http.get<User | null>(selfUrl, { headers: headers })
			.pipe(
				catchError(this.handleUserDetailsHttpError())
			);
	}

	private processResponse(username: string | null, password: string | null, details: User | null): boolean {
		var authenticated: boolean;
		if (details) {
			details = new User(details.id, details);
			details.password = password;
			authenticated = true;
		} else if (username) {
			details = { id: null, username: username, password: password, authorities: [] };
			authenticated = false;
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
	 * Iff the authentication is successful, {@link authenticated$} will provide true.
	 * The method however updates the {@link username} and {@link password} attributes even if authentication fails.
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
			map(ud => this.processResponse(username, password, ud))
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
		return this.endServerSession().pipe(
			flatMap(() => {
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
	 * The method provides a value indicating whether authentication was successful.
     * That is, whether there is a current session.
	 * That indirectly makes use of an HTTP request, which is a cold Observable,
	 * so this is a cold Observable too.
	 * That is, the expensive HTTP request will not be made until something subscribes to this Observable.
	 *
	 * The method updates the #username and #password attributes, the #authenticated$ Observable,
	 * and the authorisations of the current user.
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

	private endServerSession(): Observable<null> {
		return this.http.post<null>(logoutUrl, null)
			.pipe(
				catchError(this.handleLogoutHttpError())
			);
	}

	private handleLogoutHttpError() {
		return (error: any): Observable<null> => {
			// Do not log errors, all are equivalent to authentication failure.
			return of(null);
		};
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
			map(authorities => authorities.includes('ROLE_PLAYER') || authorities.includes('ROLE_MANAGE_USERS'))
		);
	}
}
