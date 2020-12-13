import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../user';
import { UserDetails } from '../user-details';

@Injectable({
	providedIn: 'root'
})
export class UserService {

	private userUrl = '/api/user';  // URL to API

	constructor(
		private http: HttpClient) { }

	getUsers(): Observable<User[]> {
		return this.http.get<User[]>(this.userUrl)
			.pipe(
				catchError(this.handleError<User[]>('getUsers', []))
			);
	}

	getUser(id: uuid): Observable<User | null> {
		const url = `${this.userUrl}/${id}`;
		return this.http.get<User>(url)
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
		return this.http.post<User>(this.userUrl, userDetails)
			.pipe(
				catchError(this.handleError<User | null>(`add username=${userDetails.username}`, null))
			);
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
