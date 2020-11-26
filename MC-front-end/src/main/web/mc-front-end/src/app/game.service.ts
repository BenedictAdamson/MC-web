import { Observable, of } from 'rxjs';
import { catchError, flatMap, map } from 'rxjs/operators';
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

	static getApiGamesPath(scenario: uuid): string {
		return '/api/scenario/' + scenario + '/game/';
	}

	static getApiGamePath(id: GameIdentifier): string {
		return GameService.getApiGamesPath(id.scenario) + id.created;
	}

    /**
     * Get the creation times (instance IDs) of the games of a scenario.
     */
	getGamesOfScenario(scenario: uuid): Observable<string[]> {
		return this.http.get<string[]>(GameService.getApiGamesPath(scenario))
			.pipe(
				catchError(this.handleError<string[]>('getGamesOfScenario', []))
			);
	}

    /**
     * Get the game that has a given ID.
     */
	getGame(id: GameIdentifier): Observable<Game> {
		return this.http.get<Game>(GameService.getApiGamePath(id))
			.pipe(
				catchError(this.handleError<Game>('getGame', null))
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
	createGame(scenario: uuid): Observable<Game> {
		/* The server actually replies to the POST with a 302 (Found) redirect to the resource of the created game.
		 * The HttpClient or browser itself handles that redirect for us.
	     */
		return this.http.post<Game>(GameService.getApiGamesPath(scenario), "");
	}


	private putGame(game: Game): Observable<boolean> {
		return this.http.put<Game>(GameService.getApiGamePath(game.identifier), game, { observe: "body", responseType: "json" })
			.pipe(
				map(() => true),
				catchError(this.handleError<boolean>('putGame', false))
			);
	}

	/**
	 * Change a game so it is no longer [[Game.recruiting|recruiting]] players.

     * @param id
     * The unique ID of the game for which to end recuitment.
     * @returns
     * An [[Observable]] that provides the updated state of the game.
     * The provided game is null if the given {@code id} is not recognized.
     * The provided game is null or its [[Game.identifier]] is equal to the given {@code id}.
     * The provided game is not [[Game.recruiting|recruiting]] players.
	 */
	endRecuitment(id: GameIdentifier): Observable<Game> {
		return this.getGame(id).pipe(
			map(game => { game.recruiting = false; return game }),
			flatMap(game => this.putGame(game)),
			flatMap(() => this.getGame(id))
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
