import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AbstractGamePlayersService } from './abstract.game-players.service'
import { GameIdentifier } from '../game-identifier'
import { GamePlayers } from '../game-players'
import { GameService } from './game.service'


@Injectable({
	providedIn: 'root'
})
export class GamePlayersService extends AbstractGamePlayersService {

	constructor(
		private http: HttpClient
	) {
		super();
	}

	static getApiGamePlayersPath(game: GameIdentifier): string {
		return GameService.getApiGamePath(game) + '/players';
	}

	static getApiJoinGamePath(game: GameIdentifier): string {
		return GamePlayersService.getApiGamePlayersPath(game) + '?join';
	}

	static getApiGameEndRecuitmentPath(game: GameIdentifier): string {
		return GamePlayersService.getApiGamePlayersPath(game) + '?endRecruitment';
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



	protected fetchGamePlayers(game: GameIdentifier): Observable<GamePlayers | null> {
		return this.http.get<GamePlayers>(GamePlayersService.getApiGamePlayersPath(game))
			.pipe(
				catchError(this.handleError<GamePlayers | null>('fetchGamePlayers', null))
			);
	}


	protected requestJoinGame(game: GameIdentifier): Observable<GamePlayers> {
		return this.http.post<GamePlayers>(GamePlayersService.getApiJoinGamePath(game), "");
	}


	protected requestEndRecruitment(game: GameIdentifier): Observable<GamePlayers> {
		return this.http.post<GamePlayers>(GamePlayersService.getApiGameEndRecuitmentPath(game), "");
	}
}
