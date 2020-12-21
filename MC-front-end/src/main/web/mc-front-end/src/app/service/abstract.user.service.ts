import { Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, filter, map, tap } from 'rxjs/operators';

import { User } from '../user';
import { UserDetails } from '../user-details';

export abstract class AbstractUserService {

	private user: Map<string, ReplaySubject<User | null>> = new Map();
	private users: ReplaySubject<User[] | null> = new ReplaySubject(1);

	constructor() {
		this.users.next(null);
	}

	getUsers(): Observable<User[]> {
		return this.users.pipe(
			distinctUntilChanged(),
			tap(users => {
				if (users == null) this.updateUsers();// do the first fetch
			}),
			filter(users => users != null),
			map((users: User[] | null) => users as User[])
		);
	}


	private createCacheForUser(id: string): ReplaySubject<User> {
		const rs: ReplaySubject<User> = new ReplaySubject<User>(1);
		this.user.set(id, rs);
		return rs;
	}

	private updateCachedUser(id: string, rs: ReplaySubject<User | null>): void {
		this.fetchUser(id).subscribe(user => rs.next(user));
	}

	getUser(id: string): Observable<User | null> {
		var rs: ReplaySubject<User | null> | undefined = this.user.get(id);
		if (!rs) {
			rs = this.createCacheForUser(id);
			this.updateCachedUser(id, rs);
		}
		return rs.pipe(
			distinctUntilChanged()
		);
	}

	/**@description
	 * Add a user with given details as a new user.
	 *
	 * @returns
	 * An observable that provides the added user, or null or there is an error.
	 */
	add(userDetails: UserDetails): Observable<User | null> {
		/* The server actually replies to the POST with a 302 (Found) redirect to the resource of the created user.
		 * The HttpClient or browser itself handles that redirect for us.
		 */
		return this.postUser(userDetails);
	}

	/**
	 * Ask the service to update its cached value for a user.
	 *
	 * The method does not block, but instead performs the update asynchronously.
	 * The updated value will eventually become available through the [[Observable]]
	 * returned by [[getUser]].
	 */
	updateUser(id: string): void {
		var rs: ReplaySubject<User | null> | undefined = this.user.get(id);
		if (!rs) {
			rs = this.createCacheForUser(id);
		}
		this.updateCachedUser(id, rs);
	}

	/**
	 * Ask the service to update its cached value for the list of users.
	 *
	 * The method does not block, but instead performs the update asynchronously.
	 * The updated value will eventually become available through the [[Observable]]
	 * returned by [[getUsers]].
	 */
	updateUsers(): void {
		this.fetchUsers().subscribe(
			users => this.users.next(users)
		);
	}


	protected abstract fetchUsers(): Observable<User[]>;

	protected abstract fetchUser(id: string): Observable<User | null>;

	protected abstract postUser(userDetails: UserDetails): Observable<User | null>;
}
