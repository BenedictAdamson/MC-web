import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
	selector: 'app-self',
	templateUrl: './self.component.html',
	styleUrls: ['./self.component.css']
})
export class SelfComponent implements OnInit {

	constructor(
		private readonly router: Router,
		private readonly keycloak: KeycloakService) { }

	ngOnInit(): void {
	}

	getUsername(): string { return this.keycloak.getUsername(); }

	isLoggedIn(): Promise<boolean> { return this.keycloak.isLoggedIn(); }

	async login() {
		await this.keycloak.login({
			redirectUri: window.location.origin + this.router.url
		});
	}
}
