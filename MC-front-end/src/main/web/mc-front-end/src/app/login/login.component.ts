import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

import { SelfService } from '../self.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	constructor(
		private readonly service: SelfService
	) { }

	ngOnInit(): void {
		this.username = this.service.username;
		this.password = this.service.password;
	}

	username: string = null;

	password: string = null;

	/**
     * @description
     * Attempts to authenticate using the #username and #password,
     * through the SelfService associated with this component.
     */
	login(): Observable<void> {
		return this.service.authenticate(this.username, this.password);
	}
}
