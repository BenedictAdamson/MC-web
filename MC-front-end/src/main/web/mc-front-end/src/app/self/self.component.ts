import { Component, OnInit } from '@angular/core';
import { Observable, defer, from } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';

@Component({
	selector: 'app-self',
	templateUrl: './self.component.html',
	styleUrls: ['./self.component.css']
})
export class SelfComponent implements OnInit {

	constructor(
		private readonly keycloak: KeycloakService) { }

	ngOnInit(): void {
	}

	getUsername(): string { return this.keycloak.getUsername(); }

	/**
	 * This indirectly makes use of an HTTP request, which is a cold Observable,
     * so this is a cold Observable too.
     * That is, the expensive HTTP request will not be made until something subscribes to this Observable.
	 */
	loggedIn: Observable<boolean> = defer(() =>
		from(this.keycloak.isLoggedIn()));

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
