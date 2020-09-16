import { Component, OnInit } from '@angular/core';
import { Observable, Subject, defer, from } from 'rxjs';
import { KeycloakEvent, KeycloakEventType } from 'keycloak-angular';

import { SelfService } from '../self.service';

@Component({
	selector: 'app-self',
	templateUrl: './self.component.html',
	styleUrls: ['./self.component.css']
})
export class SelfComponent implements OnInit {

	constructor(
		private readonly service: SelfService) {
	}

	ngOnInit(): void {
		// Do nothing
	}

	username$: Observable<string> = this.service.username$;

	loggedIn$: Observable<boolean> = this.service.loggedIn$;

	/**
	 * This indirectly makes use of an HTTP request, which is a cold Observable,
     * so this is a cold Observable too.
     * That is, the expensive HTTP request will not be made until something subscribes to this Observable.
	 */
	login(): Observable<void> {
		return this.service.login();
	}
}
