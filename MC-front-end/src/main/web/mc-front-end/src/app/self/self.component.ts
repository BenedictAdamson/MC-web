import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { Component, OnInit } from '@angular/core';

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

	get id$(): Observable<uuid> { return this.service.id$; };

	get username$(): Observable<string> { return this.service.username$; };

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
