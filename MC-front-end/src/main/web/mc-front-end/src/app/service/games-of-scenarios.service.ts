import { Observable, ReplaySubject, of } from 'rxjs';
import { catchError, distinctUntilChanged } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GameIdentifier } from '../game-identifier';



export function getApiGamesPath(scenario: string): string {
	return '/api/scenario/' + scenario + '/game/';
}

export function getApiGamePath(id: GameIdentifier): string {
	return getApiGamesPath(id.scenario) + id.created;
}


@Injectable({
	providedIn: 'root'
})
export class GamesOfScenarioService {

	private gamesOfScenarios: Map<string, ReplaySubject<string[]>> = new Map();

	constructor(
		private http: HttpClient) { }

	/**
	 * Get the creation times (instance IDs) of the games of a scenario.
	 *
	 * The service might have to request the server for this information.
	 * However, it caches responses, so the value provided by the returned [[Observable]]
	 * could be an immediately available cached value that does not require contacting the server.
	 *
	 * The  [[Observable]] returned by this method does not normally immediately end
	 * once it has provided one value for the games of the scenario. It will provide additional values
	 * (after the first) as updated values if it has been asked to [[updateGamesOfScenario]].
	 *
	 * The  [[Observable]] returned by this method emits only distinct values.
	 */
	getGamesOfScenario(scenario: string): Observable<string[]> {
		var rs: ReplaySubject<string[]> | undefined = this.gamesOfScenarios.get(scenario);
		if (!rs) {
			rs = this.createCacheForGamesOfScenario(scenario);
			this.updateCachedGamesOfScenario(scenario, rs);
		}
		return rs.pipe(
			distinctUntilChanged()
		);
	}


	private createCacheForGamesOfScenario(scenario: string): ReplaySubject<string[]> {
		const rs: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
		this.gamesOfScenarios.set(scenario, rs);
		return rs;
	}

	private updateCachedGamesOfScenario(scenario: string, rs: ReplaySubject<string[]>): void {
		this.fetchGamesOfScenario(scenario).subscribe(games => rs.next(games));
	}

	private fetchGamesOfScenario(scenario: string): Observable<string[]> {
		return this.http.get<string[]>(getApiGamesPath(scenario))
			.pipe(
				catchError(this.handleError<string[]>('fetchGamesOfScenario', []))
			);
	}


	/**
	 * Ask the service to update its cached value for the creation times (instance IDs) of the games of a scenario.
	 *
	 * The method dpes nt block, but instead performs the update asynchronously.
	 * The updated value will eventually become available through the [[Observable]]
	 * returned by [[getGamesOfScenario]].
	 */
	updateGamesOfScenario(scenario: string): void {
		var rs: ReplaySubject<string[]> | undefined = this.gamesOfScenarios.get(scenario);
		if (!rs) {
			rs = this.createCacheForGamesOfScenario(scenario);
		}
		this.updateCachedGamesOfScenario(scenario, rs);
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
