import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../user';
import { UserDetails } from '../user-details';

@Injectable({
	providedIn: 'root'
})
export class UserService {

	static apiUsersPath: string = '/api/user';

	static getApiUserPath(id: string): string {
		return UserService.apiUsersPath + '/' + id;
	}

	constructor(
		private http: HttpClient) { }

	getUsers(): Observable<User[]> {
		return this.http.get<User[]>(UserService.apiUsersPath)
			.pipe(
				catchError(this.handleError<User[]>('getUsers', []))
			);
	}

	getUser(id: string): Observable<User | null> {
		return this.http.get<User>(UserService.getApiUserPath(id))
			.pipe(
				catchError(this.handleError<User>(`getUser id=${id}`))
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
		return this.http.post<User>(UserService.apiUsersPath, userDetails)
			.pipe(
				catchError(this.handleError<User | null>(`add username=${userDetails.username}`, null))
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
		// FIXME
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
}
