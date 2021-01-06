import { Observable, throwError, of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { AbstractUserBackEndService } from '../abstract.user.back-end.service';
import { UserDetails } from '../../user-details';
import { User } from '../../user';


export class MockUserBackEndService extends AbstractUserBackEndService {

	constructor(
		public users: User[]
	) {
		super();
	}


	getAll(): Observable<User[]> {
		return of(this.users);
	}

	get(id: string): Observable<User | null> {
		for (let user of this.users) {
			if (user.id == id) return of(user);
		}
		return of(null);
	}

	add(specification: UserDetails): Observable<User> {
		for (let present of this.users) {
			if (present.username == specification.username) return throwError('already exists');
		}
		const user: User = new User(uuid(), specification);
		this.users.push(user);
		return of(user);

	}
}

