import { tap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
	 * Whether these credentials have been explicitly rejected by the server.
     * This will be false if the credentials have not *yet* been checked by the server.
	 */
	rejected: boolean = false;

	/**
     * @description
     * Attempts to authenticate using the #username and #password,
     * through the SelfService associated with this component.
     */
	login(): void {
		this.service.authenticate(this.username, this.password).pipe(
			tap((success) => {
				this.rejected = !success;
				if (success) {
					this.router.navigateByUrl('/')
				}
			})
		).subscribe();
	}
}
