import { Injectable } from '@angular/core';
import { Observable, defer, of, from } from 'rxjs';
import { map, mergeMap, tap, filter } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
	providedIn: 'root'
})
export class SelfService {

    /**
     * @description
     * Initial state:
     * not ##isLoggedIn()
     */
	constructor(
		private keycloakFactory: Observable<KeycloakService>
	) { }

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
		return new Observable<KeycloakService>((s) => {
			// Provide the cached value (may be null)
			s.next(this.keycloak);
			if (this.keycloak != null) {
				s.complete();
			} else {
				// Eventaully provide a newly constructed value, caching that value
				this.keycloakFactory.pipe(
					k => this.acquireOperator$(k)
				).subscribe(s);
			}

			return {
				unsubscribe() { }
			}
		});
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
