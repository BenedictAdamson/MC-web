import { Observable, of } from 'rxjs';

import { AbstractSelfService } from '../abstract.self.service';
import { User } from '../../user';

export class MockSelfService extends AbstractSelfService {

	checkForCurrentAuthentication_calls: number = 0;

	constructor(
		private self: User | null
	) {
		super();
	};


	protected getUserDetails(username: string | null, password: string | null): Observable<User | null> {
		return of(this.self);
	}

	protected postLogout(): Observable<null> {
		this.self = null;
		return of(null);
	}

}// class