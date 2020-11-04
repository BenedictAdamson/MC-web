import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Game } from './game'
import { GameIdentifier } from './game-identifier'


@Injectable({
	providedIn: 'root'
})
export class GameService {

	constructor(
		private http: HttpClient) { }

	static getGamesPath(scenario: uuid): string {
		return '/api/scenario/' + scenario + '/game/';
	}

	static getGamePath(id: GameIdentifier): string {
		return GameService.getGamesPath(id.scenario) + id.created;
	}

    /**
     * Get the creation times (instance IDs) of the games of a scenario.
     */
	getGamesOfScenario(scenario: uuid): Observable<string[]> {
		return this.http.get<string[]>(GameService.getGamesPath(scenario))
			.pipe(
				catchError(this.handleError<string[]>('getGamesOfScenario', []))
			);
	}

    /**
     * Get the game that has a given ID.
     */
	getGame(id: GameIdentifier): Observable<Game> {
		return this.http.get<Game>(GameService.getGamePath(id))
			.pipe(
				catchError(this.handleError<Game>('getGame', null))
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
