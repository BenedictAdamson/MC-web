import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject, defer, of, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map, mergeMap, tap } from 'rxjs/operators';

const apiUrl: string = '/api/self';

class UserDetails {
	username: string;
	password: string;
	authorities: string[];
}

/**
 * @description
 * Provide information about the current user,
 * and an interface for authentication (logging in),
 * as a facade in front of the actual authentication implementation used.
 *
 * Also provides information as Observables, even if the authentication implementation does not do so. 
 */
@Injectable({
	providedIn: 'root'
})
export class SelfService {

	private username_: string = null;
	private password_: string = null;
	/**
	 * provides null if not authenticated
	 */
	private authoritiesRS$: ReplaySubject<string[]> = new ReplaySubject(1);

    /**
     * @description
     * Initial state:
     * * null username
     * * null password
     * * not ##authenticated$
     * * no ##authorities$
     *
     * Instancing this class does not trigger a login request or any network traffic.
     */
	constructor(
		private http: HttpClient
	) {
		this.authoritiesRS$.next(null);
	}

    /**
     * @description
     * The name of the current user.
     *
     * null if the user name is unknown,
     * which includes the case that the user is not logged in.
     * The current user name can be known even if that user has not been authenticated.
     */
	get username(): string {
		return this.username_;
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
	get password(): string {
		return this.password_;
	}

	private handleUserDetailsHttpError() {
		return (error: any): Observable<UserDetails> => {
			console.error(error); // log to console instead
			return of(null as UserDetails);
		};
	}

	private getUserDetails(): Observable<UserDetails> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Authorization': 'Basic ' + btoa(this.username + ':' + this.password)
		});

		return this.http.get<UserDetails>(apiUrl, { headers: headers })
			.pipe(
				catchError(this.handleUserDetailsHttpError())
			);
	}

	private processResponse(details: UserDetails): void {
		var authorities: string[] = details ? details.authorities : null;
		this.authoritiesRS$.next(authorities);
	}

	/**
	 * @description
	 * Change the credentials of the current user.
	 *
	* The method attempts authentication (login) of the user.
	* That indirectly makes use of an HTTP request, which is a cold Observable,
	* so this is a cold Observable too.
	* That is, the expensive HTTP request will not be made until something subscribes to this Observable.
	*
	* Iff the authentication is sucessful, #authenticated$ will provide true.
	* The method however updates the #username and #password attributes even if authentication fails.
	* The #authorities$ Observable will provide the authorities of the authenticated user,
	* if authentication is successful.
	*/
	authenticate(username: string, password: string): Observable<void> {
		this.username_ = username;
		this.password_ = password;
		return defer(() =>
			this.getUserDetails().pipe(
				tap(ud => this.processResponse(ud)),
				map(() => null)
			)
		);
	}

    /**
     * @description
     * Whether the current user is authenticated (logged in).
     *
     * Not authenticated if #username is null or #password is null.
     */
	get authenticated$(): Observable<boolean> {
		return this.authoritiesRS$.pipe(
			map(a => a != null)
		);
	}

	/**
	 * @description
     * The authorities (authorised roles) of the current user.
     *
     * These values are for role based access control (RBAC).
     * A user that has not been authenticated has no authorities.
     * An authenticated user could have no authorities, although that is unlikely in practice. 
	 */
	get authorities$(): Observable<string[]> {
		return this.authoritiesRS$.pipe(
			map(a => a ? a : [])
		);
	}
}
