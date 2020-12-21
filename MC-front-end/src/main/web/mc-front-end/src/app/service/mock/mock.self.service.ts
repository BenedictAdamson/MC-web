import { Observable, defer, of } from 'rxjs';

import { SelfService } from '../self.service';
import { User } from '../../user';

export class MockSelfService {

	checkForCurrentAuthentication_calls: number = 0;

	constructor(
		private self: User | null,
		private mayListUsers: boolean
	) { };

	get id$(): Observable<string | null> {
		return of(this.self ? this.self.id : null);
	}

	get username$(): Observable<string | null> {
		return of(this.self ? this.self.username : null);
	}

	get authenticated$(): Observable<boolean> {
		return of(this.self != null);
	}

	get mayManageGames$(): Observable<boolean> {
		return of(this.self ? this.self.authorities.includes('ROLE_MANAGE_GAMES') : false);
	}

	get mayManageUsers$(): Observable<boolean> {
		return of(this.self ? this.self.authorities.includes('ROLE_MANAGE_USERS') : false);
	}


	get mayListUsers$(): Observable<boolean> {
		return of(this.mayListUsers);
	}

	checkForCurrentAuthentication(): Observable<null> {
		this.checkForCurrentAuthentication_calls++;
		return of(null);
	}

	logout(): Observable<null> {
		return defer(() => {
			this.self = null;
			return of(null)
		});
	}
}// class