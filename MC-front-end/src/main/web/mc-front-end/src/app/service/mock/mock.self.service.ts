import { Observable, defer, of } from 'rxjs';

import { SelfService } from '../self.service';
import { User } from '../../user';

export class MockSelfService {

	constructor(private self: User) { };

	get username$(): Observable<string> {
		return of(this.self ? this.self.username : null);
	}

	get authenticated$(): Observable<boolean> {
		return of(this.self != null);
	}

	logout(): Observable<null> {
		return defer(() => {
			this.self = null;
			return of(null)
		});
	}
}// class