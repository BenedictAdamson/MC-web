import { Observable, ReplaySubject, of } from 'rxjs';
import { catchError, distinctUntilChanged } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GameIdentifier } from '../game-identifier'
import { GamePlayers } from '../game-players'
import { GameService } from './game.service'


@Injectable({
	providedIn: 'root'
})
export class GamePlayersService {

	private gamesPlayers: Map<string, ReplaySubject<GamePlayers | null>> = new Map();

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

	private static createKey(game: GameIdentifier): string {
		return game.scenario + '@' + game.created;
	}




	private createCacheForGamePlayers(game: GameIdentifier): ReplaySubject<GamePlayers> {
		const rs: ReplaySubject<GamePlayers> = new ReplaySubject<GamePlayers>(1);
		this.gamesPlayers.set(GamePlayersService.createKey(game), rs);
		return rs;
	}

	private fetchGamePlayers(game: GameIdentifier): Observable<GamePlayers | null> {
		return this.http.get<GamePlayers>(GamePlayersService.getApiGamePlayersPath(game))
			.pipe(
				catchError(this.handleError<GamePlayers | null>('fetchGamePlayers', null))
			);
	}

	private updateCachedGamePlayers(game: GameIdentifier, rs: ReplaySubject<GamePlayers | null>): void {
		this.fetchGamePlayers(game).subscribe(gamePlayers => rs.next(gamePlayers));
	}

    /**
     * Get the players of the game that has a given ID.
     *
     * The service might have to request the server for this information.
     * However, it caches responses, so the value emitted by the returned [[Observable]]
     * could be an immediately available cached value that does not require contacting the server.
     *
     * The  [[Observable]] returned by this method does not normally immediately end
     * once it has emitted one value. It will emit additional values
     * (after the first) as updated values if it has been asked to [[updateGamePlayers]].
     *
     * The  [[Observable]] returned by this method emits only distinct values.
     */
	getGamePlayers(game: GameIdentifier): Observable<GamePlayers | null> {
		var rs: ReplaySubject<GamePlayers | null> | undefined = this.gamesPlayers.get(GamePlayersService.createKey(game));
		if (!rs) {
			rs = this.createCacheForGamePlayers(game);
			this.updateCachedGamePlayers(game, rs);
		}
		return rs.pipe(
			distinctUntilChanged()
		);
	}

    /**
     * Ask the service to update its cached value for the players of a game.
     *
     * The method does not block, but instead performs the update asynchronously.
     * The updated value will eventually become available through the [[Observable]]
     * returned by [[getGamePlayers]].
     */
	updateGamePlayers(game: GameIdentifier): void {
		var rs: ReplaySubject<GamePlayers | null> | undefined = this.gamesPlayers.get(GamePlayersService.createKey(game));
		if (!rs) {
			rs = this.createCacheForGamePlayers(game);
		}
		this.updateCachedGamePlayers(game, rs);
	}

    /**
     * Ask the service to update its cached value for whether the current user may join the game that has a given ID.
     *
     * The method does not block, but instead performs the update asynchronously.
     * The updated value will eventually become available through the [[Observable]]
     * returned by [[mayJoinGame]].
     */
	updateMayJoinGame(game: GameIdentifier): void {
		// FIXME
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
