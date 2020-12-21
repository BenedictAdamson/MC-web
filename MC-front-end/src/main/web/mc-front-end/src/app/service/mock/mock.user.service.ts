import { Observable, of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { UserDetails } from '../../user-details';
import { UserService } from '../user.service';
import { User } from '../../user';

export class MockUserService {
	users: User[] = [];

	getUsers(): Observable<User[]> {
		return of(this.users);
	}

	getUser(username: string): Observable<User | null> {
		for (let user of this.users) {
			if (user.username == username) return of(user);
		}
		return of(null);
	}

	add(userDetails: UserDetails): Observable<User | null> {
		for (let present of this.users) {
			if (present.username == userDetails.username) return of(null);
		}
		const user: User = new User(uuid(), userDetails);
		this.users.push(user);
		return of(user);
	}
}

