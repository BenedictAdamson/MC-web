import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';

import { User } from '../user';
import { UserService } from '../user.service';

@Component({
	selector: 'app-login',
	templateUrl: './add-user.component.html',
	styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {

	constructor(
		private readonly router: Router,
		private readonly service: UserService
	) { }

	ngOnInit(): void {
		this.username = "";
		this.password = "";
	}

	username: string = "";

	password: string = "";

	/**
	 * Whether this user have been explicitly rejected by the server.
     * This will be false if the user have not *yet* been submitted to the server.
	 */
	rejected: boolean = false;

	/**
     * @description
     * Attempts to add a user using the #username and #password,
     * through the UserService associated with this component.
     */
	add(): void {
		const user: User = { username: 'FIXME', password: 'FIXME', authorities: [] };//FIXME
		this.service.add(user).pipe(
			tap(
				ok => {
					this.rejected = !ok;
					if (ok) {
						this.router.navigateByUrl('/user')
					}
				}));
	}
}
