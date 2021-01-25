import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AbstractSelfService } from './abstract.self.service';
import { User } from '../user';

const selfUrl: string = '/api/self';
const logoutUrl: string = '/logout';

/**
 * @description
 * Provide information about the current user,
 * and an interface for authentication (logging in).
 */
@Injectable({
	providedIn: 'root'
})
export class SelfService extends AbstractSelfService {


	/**
	 * @description
	 * Initial state:
	 * * null [[username$]]
	 * * null [[password$]]
	 * * not [[authenticated$]]
	 *
	 * Instancing this class does not trigger a login request or any network traffic.
	 */
	constructor(
		private http: HttpClient
	) {
		super();
	}

	private handleUserDetailsHttpError() {
		return (): Observable<User | null> => {
			// Do not log errors, all are equivalent to authentication failure.
			return of(null);
		};
	}

	private static createHeaders(username: string | null, password: string | null): HttpHeaders {
		var headers: HttpHeaders = new HttpHeaders();
		headers = headers.set('X-Requested-With', 'XMLHttpRequest');
		if (username && password) {
			headers = headers.set('Authorization', 'Basic ' + btoa(username + ':' + password));
		}
		return headers;
	}

	protected getUserDetails(username: string | null, password: string | null): Observable<User | null> {
		const headers: HttpHeaders = SelfService.createHeaders(username, password);

		return this.http.get<User | null>(selfUrl, { headers: headers })
			.pipe(
				catchError(this.handleUserDetailsHttpError())
			);
	}

	private handleLogoutHttpError() {
		return (): Observable<null> => {
			// Do not log errors, all are equivalent to authentication failure.
			return of(null);
		};
	}

	protected postLogout(): Observable<null> {
		return this.http.post<null>(logoutUrl, null)
			.pipe(
				catchError(this.handleLogoutHttpError())
			);
	}

}
