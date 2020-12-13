import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SelfService } from '../service/self.service';
import { User } from '../user';
import { UserService } from '../service/user.service';

@Component({
	selector: 'app-users',
	templateUrl: './users.component.html',
	styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

	users: User[];

	constructor(private selfService: SelfService, private userService: UserService) { }

	ngOnInit() {
		this.userService.getUsers().subscribe(users => this.users = users);
	}

	/**
	 * @description
     * Whether the current user has permission to manage (add and remove) users.
     *
     * A user that has not been authenticated does not have that permission.
	 */
	get mayManageUsers$(): Observable<boolean> {
		return this.selfService.mayManageUsers$;
	}

}
