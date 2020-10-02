import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';

import { SelfService } from '../self.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	constructor(
		private readonly router: Router,
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
	login(): void {
		this.service.authenticate(this.username, this.password).pipe(
			tap((success) => {
				if (success) {
					this.router.navigateByUrl('/')
				}
			})
		).subscribe();
	}
}
