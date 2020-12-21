import { Observable, of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { AbstractUserService } from '../abstract.user.service'
import { UserDetails } from '../../user-details';
import { User } from '../../user';

export class MockUserService extends AbstractUserService {

	constructor(
		private value: User[]
	) {
		super();
	}


	protected fetchUsers(): Observable<User[]> {
		return of(this.value);
	}

	protected fetchUser(id: string): Observable<User | null> {
		for (let user of this.value) {
			if (user.id == id) return of(user);
		}
		return of(null);
	}

	protected postUser(userDetails: UserDetails): Observable<User | null> {
		for (let present of this.value) {
			if (present.username == userDetails.username) return of(null);
		}
		const user: User = new User(uuid(), userDetails);
		this.value.push(user);
		return of(user);

	}
}

