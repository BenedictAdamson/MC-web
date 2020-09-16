import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, defer, of, from } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

/**
 * Provide information about the currently logged in user,
 * and an interface for logging in.
 */
@Injectable({
	providedIn: 'root'
})
export class SelfService {

	private static keycloakFactory(): KeycloakService { return new KeycloakService };

	private keycloakFactory: () => KeycloakService;

	private hasKeycloak: boolean = false;

    /**
     * @description
     * The Keycloak service that this service uses for authentication.
     *
     * Subscribing to this Observable does not trigger creation of a KeycloakService.
     * It provides a null value if the KeycloakService has not (yet) been created.
     */
	readonly keycloak$: ReplaySubject<KeycloakService> = new ReplaySubject(1);

    /**
     * @description
     * Initial state:
     * not ##isLoggedIn()
     *
     * Instancing this class does not trigger a login request or any network traffic.
     *
     * @param keycloakFactory
     * A function returning a newly constructed KeycloakService object.
     * Intended for use in unit tests, which might want to inject a mock KeycloakService.
     * If absent (the usual case, or if null), the constructor uses a factory that provides a real KeycloakService.
     */
	constructor(keycloakFactory?: () => KeycloakService) {
		keycloakFactory = keycloakFactory ? keycloakFactory : SelfService.keycloakFactory;
		this.keycloakFactory = keycloakFactory;
		this.keycloak$.next(null);
	}

    /**
     * @description
     * The name of the currently logged in user.
     *
     * Provides null if the user name is unknown,
     * which includes the case that the user is not logged in.
     * Subscribing to this Observable does not trigger a login request.
     */
	get username$(): Observable<string> {
		return this.keycloak$.pipe(
			map((k: KeycloakService) => k ? k.getUsername() : null)
		);
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
     * Subscribing to this Observable triggers creation and iniitailisation of a KeycloakService,
     * if there is no value already.
     * It provides a null value if creation fails.
     */
	private get createdKeycloak$(): Observable<KeycloakService> {
		if (this.hasKeycloak) {
			return this.keycloak$;
		} else {
			return defer(() => of(this.keycloakFactory()).pipe(
				mergeMap((k: KeycloakService) =>
					(k ? from(k.init()) : of(false)).pipe(
						map((ok: boolean) => ok ? k : null)// convert init failure to null
					)
				),
				tap((k: KeycloakService) => {// cache the created value
					this.hasKeycloak = (k != null);
					this.keycloak$.next(k)
				})
			));
		}
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
		return this.createdKeycloak$.pipe(
			mergeMap((k: KeycloakService) => k ? from(k.login()) : of(null))
		);
	}
}
