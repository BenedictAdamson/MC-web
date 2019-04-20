import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Player } from './player';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})
export class PlayerService {

    private playerUrl = '/api/player';  // URL to API

    constructor(
        private http: HttpClient) { }

    getPlayers(): Observable<Player[]> {
        return this.http.get<Player[]>(this.playerUrl)
            .pipe(
                catchError(this.handleError<Player[]>('getPlayers', []))
            );
    }

    getPlayer(username: string): Observable<Player> {
        const url = `${this.playerUrl}/${username}`;
        return this.http.get<Player>(url)
            .pipe(
                catchError(this.handleError<Player>(`getPlayer id=${username}`))
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
