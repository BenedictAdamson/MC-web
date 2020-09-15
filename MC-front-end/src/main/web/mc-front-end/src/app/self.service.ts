import { Injectable } from '@angular/core';
import { Observable, defer } from 'rxjs';
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


	/**
	 * This indirectly makes use of an HTTP request, which is a cold Observable,
     * so this is a cold Observable too.
     * That is, the expensive HTTP request will not be made until something subscribes to this Observable.
	 */
	login(): Observable<void> {
		return defer(() => { });
	}
}
