import { Observable, ReplaySubject, combineLatest, from } from 'rxjs';
import { distinctUntilChanged, finalize, first, flatMap, map, tap } from 'rxjs/operators';

import { User } from '../user';
import { UserDetails } from '../user-details';

export abstract class AbstractUserService {

	private complete: boolean = false;
	private validIds$: ReplaySubject<string[]> = new ReplaySubject(1);
	private user: Map<string, ReplaySubject<User | null>> = new Map();

	constructor() {
		this.validIds$.next([]);// initially none are known
	}

	getUsers(): Observable<User[]> {
		if (!this.complete) {
			this.updateUsers();
		}
		return this.validIds$.pipe(
			distinctUntilChanged(),// do not spam changes
			map((ids: string[]) => {// get the ReplySubjects for the valid user IDs
				const rses: Observable<User | null>[] = [];
				for (var id of ids) {
					const rs: ReplaySubject<User | null> | undefined = this.user.get(id);
					if (rs) rses.push(rs.asObservable());
				}
				return rses;
			}),
			flatMap((rses: Observable<User | null>[]) =>
				combineLatest(rses).pipe(
					// remove nulls
					map((users: (User | null)[]) => users.filter((user) => !!user) as User[])
				)));
	}


	private createCacheForUser(id: string): ReplaySubject<User> {
		const rs: ReplaySubject<User> = new ReplaySubject<User>(1);
		this.user.set(id, rs);
		return rs;
	}

	private addValidId(id: string): void {
		this.validIds$.pipe(
			first() // once only
		).subscribe((ids: string[]) => {
			if (!ids.includes(id)) {
				ids.push(id);
				this.validIds$.next(ids)
			}// else already known
		});
	}

	private removeValidId(id: string): void {
		this.validIds$.pipe(
			first() // once only
		).subscribe((ids: string[]) => {
			if (ids.includes(id)) {
				ids = ids.filter(i => i != id);
				this.validIds$.next(ids)
			}// else already known to be invalid
		});
	}

	private updateCachedUser(id: string, rs: ReplaySubject<User | null>): void {
		this.fetchUser(id).subscribe((user: User | null) => {
			rs.next(user);
			if (user) {
				this.addValidId(id);
			} else {
				this.removeValidId(id);
			}
		});
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

	private setUser(user: User): void {
		const id: string = user.id;
		var rs: ReplaySubject<User | null> | undefined = this.user.get(id);
		if (!rs) {
			rs = this.createCacheForUser(id);
		}
		rs.next(user);
		this.addValidId(id);
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
		return this.postUser(userDetails).pipe(
			tap((user: User | null) => { if (user) this.setUser(user as User) })
		);
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
			(users: User[]) => {
				users.forEach(user => this.setUser(user));
				// Remove ids that are no longer valid:
				const ids: string[] = users.map(user => user.id);
				this.validIds$.next(ids);
				this.complete = true;
			});
	}


	protected abstract fetchUsers(): Observable<User[]>;

	protected abstract fetchUser(id: string): Observable<User | null>;

	protected abstract postUser(userDetails: UserDetails): Observable<User | null>;
}
