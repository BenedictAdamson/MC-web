import { Observable, ReplaySubject, of } from 'rxjs';
import { catchError, distinctUntilChanged } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Game } from '../game'
import { GameIdentifier } from '../game-identifier'


@Injectable({
	providedIn: 'root'
})
export class GameService {

	constructor(
		private http: HttpClient) { }

	static getApiGamesPath(scenario: string): string {
		return '/api/scenario/' + scenario + '/game/';
	}

	static getApiGamePath(id: GameIdentifier): string {
		return GameService.getApiGamesPath(id.scenario) + id.created;
	}

    /**
     * Get the game that has a given ID.
     */
	getGame(id: GameIdentifier): Observable<Game | null> {
		return this.http.get<Game>(GameService.getApiGamePath(id))
			.pipe(
				catchError(this.handleError<Game | null>('getGame', null))
			);
	}

    /**
     * Create a new game for a given scenario.
     *
     * @param scenario
     * The unique ID of the scenario for which to create a gave.
     * @returns
     * An [[Observable]] that provides the created game.
     * The [[GameIdentifier.scenario]] of the [[Game.identifier]] of the created game
     * is equal to the given {@code scenario}.
     */
	createGame(scenario: string): Observable<Game> {
		/* The server actually replies to the POST with a 302 (Found) redirect to the resource of the created game.
		 * The HttpClient or browser itself handles that redirect for us.
	     */
		return this.http.post<Game>(GameService.getApiGamesPath(scenario), "");
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
