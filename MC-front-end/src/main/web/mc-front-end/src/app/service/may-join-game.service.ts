import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AbstractMayJoinGameService } from './abstract.may-join-game.service'
import { GameIdentifier } from '../game-identifier'
import { GameService } from './game.service'


@Injectable({
	providedIn: 'root'
})
export class MayJoinGameService extends AbstractMayJoinGameService {

	constructor(
		private http: HttpClient
	) {
		super();
	}

	static getApiGamePlayersPath(game: GameIdentifier): string {
		return GameService.getApiGamePath(game) + '/players';
	}

	static getApiMayJoinGamePath(game: GameIdentifier): string {
		return MayJoinGameService.getApiGamePlayersPath(game) + '?mayJoin';
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



	protected fetchMayJoin(game: GameIdentifier): Observable<boolean> {
		return this.http.get<boolean>(MayJoinGameService.getApiMayJoinGamePath(game))
			.pipe(
				catchError(this.handleError<boolean>('mayJoinGame', false))
			);
	}

}
