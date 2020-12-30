import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';

import { AbstractSelfService } from '../service/abstract.self.service';

@Component({
	selector: 'app-self',
	templateUrl: './self.component.html',
	styleUrls: ['./self.component.css']
})
export class SelfComponent implements OnInit {

	constructor(
		private readonly service: AbstractSelfService) {
	}

	ngOnInit(): void {
		// Do nothing
	}

	get id$(): Observable<string | null> { return this.service.id$; };

	get username$(): Observable<string | null> { return this.service.username$; };

	get authenticated$(): Observable<boolean> { return this.service.authenticated$; };

	get isLogoutDisabled$(): Observable<boolean> {
		return this.authenticated$.pipe(
			map(a => !a)
		);
	};

	logout() {
		this.service.logout().subscribe();
	}

}
