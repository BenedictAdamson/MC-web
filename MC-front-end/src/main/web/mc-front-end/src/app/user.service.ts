import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { User } from './user';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

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

    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {

            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }
}
