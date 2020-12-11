import { Observable, ReplaySubject, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Game } from './game'
import { GameIdentifier } from './game-identifier'


@Injectable({
	providedIn: 'root'
})
export class GameService {

	private gamesOfScenarios: Map<uuid, ReplaySubject<string[]>> = new Map();

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
     *
     * The service might have to request the server for this information.
     * However, it caches responses, so the value provided by the returned [[Observable]]
     * could be an immediately available cached value that does not require contacting the server.
     *
     * The  [[Observable]] returned by this method does not normally immediately ens
     * once it has provided one value for the games of the scenario. It will provide additional values
     * (after the first) as updated values if it has been asked to [[updateGamesOfScenario]].
     */
	getGamesOfScenario(scenario: uuid): Observable<string[]> {
		var rs: ReplaySubject<string[]> = this.gamesOfScenarios.get(scenario);
		if (rs) {// use existing entry
			return rs.asObservable();
		} else {
			rs = new ReplaySubject<string[]>(1);
			this.gamesOfScenarios.set(scenario, rs);
			this.fetchGamesOfScenario(scenario).subscribe(games => rs.next(games));
			return rs;
		}
	}

	private fetchGamesOfScenario(scenario: uuid): Observable<string[]> {
		return this.http.get<string[]>(GameService.getApiGamesPath(scenario))
			.pipe(
				catchError(this.handleError<string[]>('getGamesOfScenario', []))
			);
	}


    /**
     * Ask the service to update its cached value for the creation times (instance IDs) of the games of a scenario.
     *
     * The method dpes nt block, but instead performs the update asynchronously.
     * The updated value will eventually become available through the [[Observable]]
     * returned by [[getGamesOfScenario]].
     */
	updateGamesOfScenario(scenario: uuid): void {
		var rs: ReplaySubject<string[]> = this.gamesOfScenarios.get(scenario);
		if (!rs) {
			rs = new ReplaySubject<string[]>(1);
			this.gamesOfScenarios.set(scenario, rs);
		}
		this.fetchGamesOfScenario(scenario).subscribe(games => rs.next(games));
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
