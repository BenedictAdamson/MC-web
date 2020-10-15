import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { User } from './user';

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

	getUser(username: string): Observable<User> {
		const url = `${this.userUrl}/${username}`;
		return this.http.get<User>(url)
			.pipe(
				catchError(this.handleError<User>(`getUser id=${username}`))
			);
	}

	/**@description
	 * Add a given user as a new user.
     *
     * @returns
     * An observable that provides a value indicating whether addition was successful.
	 */
	add(user: User): Observable<boolean> {
		return this.http.post(this.userUrl, user)
			.pipe(
				catchError(this.handleError<boolean>(`add id=${user.username}`, false)),
				map(() => true)
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
