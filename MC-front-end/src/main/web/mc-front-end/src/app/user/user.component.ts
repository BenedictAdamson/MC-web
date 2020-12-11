import { v4 as uuid } from 'uuid';

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

	user: User;

	constructor(
		private route: ActivatedRoute,
		private userService: UserService) { }

	ngOnInit() {
		this.getUser();
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

	getUser(): void {
		const id: uuid = this.route.snapshot.paramMap.get('id');
		this.userService.getUser(id)
			.subscribe(user => this.user = user);
	}
}
