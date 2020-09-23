import { Component, OnInit } from '@angular/core';
import { Observable, Subject, defer, from, of } from 'rxjs';

@Component({
	selector: 'app-self',
	templateUrl: './self.component.html',
	styleUrls: ['./self.component.css']
})
export class SelfComponent implements OnInit {

	constructor() {
	}

	async ngOnInit(): Promise<void> {
	}

	username: string;

	loggedIn: boolean;

	/**
	 * This indirectly makes use of an HTTP request, which is a cold Observable,
     * so this is a cold Observable too.
     * That is, the expensive HTTP request will not be made until something subscribes to this Observable.
	 */
	login(): Observable<void> {
		// FIXME
		return defer(() => {
			this.username = "jeff";
			this.loggedIn = true;
			return of(null)
		});
	}
}
