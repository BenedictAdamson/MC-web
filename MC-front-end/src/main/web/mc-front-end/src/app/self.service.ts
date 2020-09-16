import { Injectable } from '@angular/core';
import { Observable, defer, of, from, concat } from 'rxjs';
import { map, mergeMap, tap, filter } from 'rxjs/operators';
import { KeycloakService, KeycloakEvent } from 'keycloak-angular';

@Injectable({
	providedIn: 'root'
})
export class SelfService {

	private static keycloakFactory(): KeycloakService { return new KeycloakService };

    /**
     * @description
     * Initial state:
     * not ##isLoggedIn()
     *
     * @param keycloakFactory
     * A function returning a newly constructed KeycloakService object.
     * Intended for use in unit tests, which might want to inject a mock KeycloakService.
     * If absent (the usual case, or if null), the constructor uses a factory that provides a real KeycloakService.
     */
	constructor(keycloakFactory?: () => KeycloakService) {
		keycloakFactory = keycloakFactory ? keycloakFactory : SelfService.keycloakFactory;
		this.keycloakFactory = keycloakFactory;
	}


	private keycloakFactory: () => KeycloakService;
	private keycloak: KeycloakService;

    /**
     * @description
     * Provides null if the user name is unknown,
     * which includes the case that the user is not logged in.
     */
	get username$(): Observable<string> {
		return this.keycloak$.pipe(
			map((k: KeycloakService) => k ? k.getUsername() : null)
		);
	};

    /**
     * @description
     * Provides true  iff #username$ provides non null.
     */
	get loggedIn$(): Observable<boolean> {
		return this.username$.pipe(
			map(n => n != null)
		);
	}


	private acquireOperator$(k$: Observable<KeycloakService>): Observable<KeycloakService> {
		return k$.pipe(
			filter((k: KeycloakService) => k != null),
			mergeMap((k: KeycloakService) =>
				from(k.init()).pipe(
					map((ok: boolean) => [k, ok]),
					filter((p: [KeycloakService, boolean]) => p[1]),
					map((p: [KeycloakService, boolean]) => p[0])
				)
			),
			tap((k: KeycloakService) => this.keycloak = k)
		);
	}

	get keycloak$(): Observable<KeycloakService> {
		if (this.keycloak) {
			return of(this.keycloak);
		} else {
			// Use the factory, and also cache its result for future use
			return of(this.keycloakFactory()).pipe(k$ => this.acquireOperator$(k$));
		}
	}

	private static loginOperator$(k$: Observable<KeycloakService>): Observable<void> {
		return k$.pipe(
			filter((k: KeycloakService) => k != null),
			mergeMap((k: KeycloakService) => from(k.login()))
		);
	}

	/**
	 * @description
	 * This indirectly makes use of an HTTP request, which is a cold Observable,
	 * so this is a cold Observable too.
	 * That is, the expensive HTTP request will not be made until something subscribes to this Observable.
	 *
	 * Iff the login is sucessful, the #getUsername() will be non null.
	 */
	login$(): Observable<void> {
		return this.keycloak$.pipe(
			SelfService.loginOperator$
		);
	}
}
