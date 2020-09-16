import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, defer, of, from, concat } from 'rxjs';
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
		this.keycloak$.next(null);
	}


	private keycloakFactory: () => KeycloakService;

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

    /**
     * Subscribing to this Observable does not trigger creation of a KeycloakService.
     * It provides a null value if the KeycloakService has not (yet) been created.
     */
	readonly keycloak$: ReplaySubject<KeycloakService> = new ReplaySubject(1);

	private hasKeycloak: boolean = false;

	private createKeycloak(): Observable<void> {
		if (this.hasKeycloak) {
			return of(null);
		} else {
			return of(this.keycloakFactory()).pipe(
				mergeMap((k: KeycloakService) =>
					(k ? from(k.init()) : of(false)).pipe(
						map((ok: boolean) => ok ? k : null)// convert init failure to null
					)
				),
				tap((k: KeycloakService) => {// cache the created value
					this.hasKeycloak = (k != null);
					this.keycloak$.next(k)
				}),
				map(() => null)
			);
		}
	}

    /**
     * Subscribing to this Observable triggers creation and iniitailisation of a KeycloakService,
     * if there is no value already.
     * It provides a null value if creatino fails.
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
	 * This indirectly makes use of an HTTP request, which is a cold Observable,
	 * so this is a cold Observable too.
	 * That is, the expensive HTTP request will not be made until something subscribes to this Observable.
	 *
	 * Iff the login is sucessful, the #getUsername() will be non null.
	 */
	login$(): Observable<void> {
		return this.createdKeycloak$.pipe(
			mergeMap((k: KeycloakService) => k ? from(k.login()) : of(null))
		);
	}
}
