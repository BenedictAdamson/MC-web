import { Component, OnInit } from '@angular/core';
import { Observable, Subject, defer, from } from 'rxjs';
import { KeycloakService, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';

@Component({
	selector: 'app-self',
	templateUrl: './self.component.html',
	styleUrls: ['./self.component.css']
})
export class SelfComponent implements OnInit {

	constructor(
		private readonly keycloak: KeycloakService) {
		this.handleLoggedOut();
	}

	async ngOnInit(): Promise<void> {
		this.keycloak.keycloakEvents$.subscribe(event => this.handle(event));
		if (await this.keycloak.isLoggedIn()) {
			this.handleLoggedIn();
		} else {
			this.handleLoggedOut();
		}
		/* As the handlers are idempotent, double handling because of subscription and the isLoggedIn() call is OK */
	}

	handleLoggedOut(): void {// idempotent
		this.username = null;
		this.loggedIn = false;
	}

	handleLoggedIn(): void {// idempotent
		this.username = this.keycloak.getUsername();
		this.loggedIn = true;
	}

	private handle(event: KeycloakEvent): void {
		switch (event.type) {
			case KeycloakEventType.OnAuthError:
			case KeycloakEventType.OnAuthLogout:
			case KeycloakEventType.OnAuthRefreshError:
				this.handleLoggedOut(); break;
			case KeycloakEventType.OnAuthRefreshSuccess:
			case KeycloakEventType.OnAuthSuccess:
				this.handleLoggedIn(); break;
			default:
			// ignore
		}
	}

	username: string;

	loggedIn: boolean;

	/**
	 * This indirectly makes use of an HTTP request, which is a cold Observable,
     * so this is a cold Observable too.
     * That is, the expensive HTTP request will not be made until something subscribes to this Observable.
	 */
	login(): Observable<void> {
		return defer(() => from(this.keycloak.login({
			redirectUri: "/"
		})));
	}
}
