import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, flatMap, map } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UserService } from '../service/user.service';
import { User } from '../user';

@Component({
	selector: 'app-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

	get id$(): Observable<string> {
		return this.route.paramMap.pipe(
			map(params => params.get('id')),
			distinctUntilChanged(),
			filter(id => !!id),
			map((id: string | null) => id as string)
		);
	}

	get user$(): Observable<User> {
		return this.id$.pipe(
			flatMap(id => this.userService.getUser(id)),
			filter(user => !!user),
			map((user: User | null) => user as User)
		)
	}

	constructor(
		private route: ActivatedRoute,
		private userService: UserService) { }

	ngOnInit() {
		// Do nothing
	}

	roleName(authority: string): string {
		switch (authority) {
			case 'ROLE_PLAYER':
				return 'player';
			case 'ROLE_MANAGE_USERS':
				return 'manage users';
			case 'ROLE_MANAGE_GAMES':
				return 'manage games';
			default:
				return authority.replace('/^ROLE_/', '').replace('/ /g', ' ').toLowerCase();
		}

	}
}
