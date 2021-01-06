import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, first, flatMap, map, tap } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { User } from '../user';
import { UserService } from '../service/user.service';

@Component({
	selector: 'app-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

	constructor(
		private route: ActivatedRoute,
		private userService: UserService
	) { }


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
			flatMap(id => this.userService.get(id)),
			filter(user => !!user),
			map((user: User | null) => user as User)
		)
	}

	get username$(): Observable<string> {
		return this.user$.pipe(
			map(user => user.username)
		);
	}

	get authorities$(): Observable<string[]> {
		return this.user$.pipe(
			map(user => user.authorities)
		);
	}

	private update(): void {
		this.id$.pipe(
			first(),// do the operation only once
			tap(id => this.userService.update(id))
		).subscribe();
	}

	ngOnInit() {
		this.update()
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
