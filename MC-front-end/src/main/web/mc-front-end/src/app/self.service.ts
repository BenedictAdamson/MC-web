import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, defer, of, from } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';

/**
 * @description
 * Provide information about the currently logged in user,
 * and an interface for logging in.,
 * as a facade in front of the actual authentication implementation used.
 *
 * Also provides information as Observables, even if the authentication implementation does not do so. 
 */
@Injectable({
	providedIn: 'root'
})
export class SelfService {

	private usernameRS$: ReplaySubject<string> = new ReplaySubject(1);

    /**
     * @description
     * Initial state:
     * not ##isLoggedIn()
     *
     * Instancing this class does not trigger a login request or any network traffic.
     */
	constructor() {
		this.usernameRS$.next(null);
	}

    /**
     * @description
     * The name of the currently logged in user.
     *
     * Provides null if the user name is unknown,
     * which includes the case that the user is not logged in.
     * Subscribing to this Observable does not trigger a login request.
     *
     * This Observable will publish new values when the currently logged in user changes.
     * That is, this is a hot observable.
     */
	get username$(): Observable<string> {
		return this.usernameRS$;
	};

    /**
     * @description
     * Whether the current user is logged in (authenticated).
     *
     * Provides true iff #username$ provides non null.
     */
	get loggedIn$(): Observable<boolean> {
		return this.username$.pipe(
			map(n => n != null)
		);
	}


	/**
	 * @description
     * Attempt login (authentication) of the current user,
     * using the associated Keycloak service.
     *
	 * This indirectly makes use of an HTTP request, which is a cold Observable,
	 * so this is a cold Observable too.
	 * That is, the expensive HTTP request will not be made until something subscribes to this Observable.
	 *
	 * Iff the login is sucessful, the #getUsername() will be non null.
	 */
	login(): Observable<void> {
		return from(of(null));//FIXME
	}
}
