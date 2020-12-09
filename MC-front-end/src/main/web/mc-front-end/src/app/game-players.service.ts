import { Observable, of } from 'rxjs';
import { catchError, flatMap, map } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GameIdentifier } from './game-identifier'
import { GamePlayers } from './game-players'
import { GameService } from './game.service'


@Injectable({
	providedIn: 'root'
})
export class GamePlayersService {

	constructor(
		private http: HttpClient
	) { }

	static getApiGamePlayersPath(game: GameIdentifier): string {
		return GameService.getApiGamePath(game) + '/players';
	}

	static getApiJoinGamePath(game: GameIdentifier): string {
		return GamePlayersService.getApiGamePlayersPath(game) + '?join';
	}

	static getApiGameEndRecuitmentPath(game: GameIdentifier): string {
		return GamePlayersService.getApiGamePlayersPath(game) + '?endRecruitment';
	}

	static getApiMayJoinGamePath(game: GameIdentifier): string {
		return GamePlayersService.getApiGamePlayersPath(game) + '?mayJoin';
	}


    /**
     * Get the players of the game that has a given ID.
     */
	getGamePlayers(game: GameIdentifier): Observable<GamePlayers> {
		return this.http.get<GamePlayers>(GamePlayersService.getApiGamePlayersPath(game))
			.pipe(
				catchError(this.handleError<GamePlayers>('getGamePlayers', null))
			);
	}

    /**
     * Ask that the current user joins the game that has a given ID.
     *
     * @param game
     * The unique ID of the game to join.
     * @returns
     * An [[Observable]] that provides the updated game players information.
     * The [[GamePlayers.identifier]] of the returned game players information
     * is equal to the given ``game``.
     */
	joinGame(game: GameIdentifier): Observable<GamePlayers> {
		/* The server actually replies to the POST with a 302 (Found) redirect to the resource of the altered game players resource.
		 * The HttpClient or browser itself handles that redirect for us.
	     */
		return this.http.post<GamePlayers>(GamePlayersService.getApiJoinGamePath(game), "");
	}


	/**
	 * Change a game so it is no longer [[Game.recruiting|recruiting]] players.

     * @param game
     * The unique ID of the game for which to end recuitment.
     * @returns
     * An [[Observable]] that provides the updated game players information.
     * The [[GamePlayers.identifier]] of the returned game players information
     * is equal to the given ``game``.
	 */
	endRecuitment(game: GameIdentifier): Observable<GamePlayers> {
		/* The server actually replies to the POST with a 302 (Found) redirect to the resource of the altered game players resource.
		 * The HttpClient or browser itself handles that redirect for us.
	     */
		return this.http.post<GamePlayers>(GamePlayersService.getApiGameEndRecuitmentPath(game), "");
	}

    /**
     * Ask whether the current user may join the game that has a given ID.
     *
     * @param game
     * The unique ID of the game to join.
     * @returns
     * An [[Observable]] that indicates whether may join.
     */
	mayJoinGame(game: GameIdentifier): Observable<boolean> {
		return this.http.get<boolean>(GamePlayersService.getApiMayJoinGamePath(game))
			.pipe(
				catchError(this.handleError<boolean>('mayJoinGame', false))
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
