import { Component, OnInit } from '@angular/core';
import { Observable, from } from 'rxjs';
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

	loggedIn: Observable<boolean> = from(this.keycloak.isLoggedIn());

	login(): Observable<void> {
		return from(this.keycloak.login({
			redirectUri: "/"
		}));
	}
}
