import { Observable, ReplaySubject, of } from 'rxjs';
import { catchError, distinctUntilChanged } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AbstractUserService } from './abstract.user.service'
import { User } from '../user';
import { UserDetails } from '../user-details';

@Injectable({
	providedIn: 'root'
})
export class UserService extends AbstractUserService {

	static apiUsersPath: string = '/api/user';

	static getApiUserPath(id: string): string {
		return UserService.apiUsersPath + '/' + id;
	}

	constructor(
		private http: HttpClient
	) {
		super();
	}

	/**
	 * Handle Http operation that failed.
	 * Let the app continue.
	 * @param operation - name of the operation that failed
	 * @param result - optional value to return as the observable result
	 */
	private handleError<T>(operation = 'operation', result?: T) {
		return (error: any): Observable<T> => {

			// TODO: send the error to remote logging infrastructure
			console.error(operation + error); // log to console instead

			// Let the app keep running by returning an empty result.
			return of(result as T);
		};
	}


	protected fetchUsers(): Observable<User[]> {
		return this.http.get<User[]>(UserService.apiUsersPath)
			.pipe(
				catchError(this.handleError<User[]>('getUsers', []))
			);
	}

	protected fetchUser(id: string): Observable<User | null> {
		return this.http.get<User>(UserService.getApiUserPath(id))
			.pipe(
				catchError(this.handleError<User>(`fetchUser id=${id}`))
			);
	}

	protected postUser(userDetails: UserDetails): Observable<User | null> {
		/* The server actually replies to the POST with a 302 (Found) redirect to the resource of the created user.
		 * The HttpClient or browser itself handles that redirect for us.
		 */
		return this.http.post<User>(UserService.apiUsersPath, userDetails)
			.pipe(
				catchError(this.handleError<User | null>(`add username=${userDetails.username}`, null))
			);
	}
}
