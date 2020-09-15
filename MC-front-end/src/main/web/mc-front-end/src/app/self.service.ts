import { Injectable } from '@angular/core';
import { Observable, defer, of, from } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
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
     * @returns
     * null if the user name is unknown,
     * which includes the case that the user is not logged in.
     */
	getUsername(): string {
		return null;
	};

    /**
     * @description
     * #isLoggedIn() iff #getUsername() is non null.
     */
	isLoggedIn(): boolean {
		return this.getUsername() != null;
	}

	getKeycloak$(): Observable<KeycloakService> {
		return new Observable<KeycloakService>((s) => {
			if (this.keycloak != null) {
				// Provide the cached value
				s.next(this.keycloak);
				s.complete();
			} else {
				// Provide a new constructed value, caching that value
				this.keycloakFactory.pipe(
					tap(k => this.keycloak = k)
				).subscribe(s);
			}

			return {
				unsubscribe() { }
			}
		});
	}

	private static loginOperator$(k$: Observable<KeycloakService>): Observable<void> {
		return k$.pipe(
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
		return this.getKeycloak$().pipe(
			SelfService.loginOperator$
		);
	}
}
