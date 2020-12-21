import { Observable, of } from 'rxjs';

import { AbstractSelfService } from '../abstract.self.service';
import { User } from '../../user';

export class MockSelfService extends AbstractSelfService {

	constructor(
		private self: User | null
	) {
		super();
	};


	protected getUserDetails(_username: string | null, _password: string | null): Observable<User | null> {
		return of(this.self);
	}

	protected postLogout(): Observable<null> {
		this.self = null;
		return of(null);
	}

}// class