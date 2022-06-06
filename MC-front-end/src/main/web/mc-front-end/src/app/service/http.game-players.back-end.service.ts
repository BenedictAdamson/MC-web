import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AbstractGamePlayersBackEndService } from './abstract.game-players.back-end.service';
import { Game } from '../game';
import { GameIdentifier } from '../game-identifier';
import { GamePlayers } from '../game-players';
import { HttpKeyValueService } from './http.key-value.service';
import { HttpGameBackEndService } from './http.game.back-end.service';



export class EncodedGamePlayers {
	game: GameIdentifier;
	recruiting: boolean;
	// eslint-disable-next-line @typescript-eslint/ban-types
	users: object;
}

export const CURRENTGAMEPATH = '/api/self/current-game';

class Delegate extends HttpKeyValueService<GameIdentifier, GamePlayers, EncodedGamePlayers, void, void> {

	constructor(
		http: HttpClient
	) {
		super(http, undefined);
	}


	getUrl(id: GameIdentifier): string {
		return HttpGamePlayersBackEndService.getApiGamePlayersPath(id);
	}

	getAll(): undefined {
		return undefined;
	}

	add(_specification: void): undefined {
		return undefined;
	}

	joinGame(game: GameIdentifier): Observable<GamePlayers> {
		return this.http.post<GamePlayers>(HttpGamePlayersBackEndService.getApiJoinGamePath(game), '').pipe(
			map(v => this.decode(v))
		);
	}

	endRecruitment(game: GameIdentifier): Observable<GamePlayers> {
		return this.http.post<GamePlayers>(HttpGamePlayersBackEndService.getApiGameEndRecruitmentPath(game), '').pipe(
			map(v => this.decode(v))
		);
	}

	getCurrentGameId(): Observable<GameIdentifier | null> {
		return this.http.get<Game>(CURRENTGAMEPATH).pipe(
			catchError(() => of(null)),
			map(g => g ? g.identifier : null)
		);
	}


	protected getAddUrl(_specification: void): undefined {
		return undefined;
	}

	protected getAddPayload(_specification: void): undefined {
		return undefined;
	}

	protected decode(encodedValue: EncodedGamePlayers): GamePlayers {
		const users: Map<string, string> = new Map(Object.entries(encodedValue.users).map(([k, v]) => ([k, v])));
		return new GamePlayers(encodedValue.game, encodedValue.recruiting, users);
	}


}// class



@Injectable({
	providedIn: 'root'
})
export class HttpGamePlayersBackEndService extends AbstractGamePlayersBackEndService {

	private delegate: Delegate;


	constructor(
		http: HttpClient
	) {
		super();
		this.delegate = new Delegate(http);
	}

	static getApiGamePlayersPath(game: GameIdentifier): string {
		return HttpGameBackEndService.getApiGamePath(game) + '/players';
	}

	static getApiJoinGamePath(game: GameIdentifier): string {
		return HttpGamePlayersBackEndService.getApiGamePlayersPath(game) + '?join';
	}

	static getApiGameEndRecruitmentPath(game: GameIdentifier): string {
		return HttpGamePlayersBackEndService.getApiGamePlayersPath(game) + '?endRecruitment';
	}


	get(id: GameIdentifier): Observable<GamePlayers | null> {
		return this.delegate.get(id);
	}

	joinGame(game: GameIdentifier): Observable<GamePlayers> {
		return this.delegate.joinGame(game);
	}

	endRecruitment(game: GameIdentifier): Observable<GamePlayers> {
		return this.delegate.endRecruitment(game);
	}

	getCurrentGameId(): Observable<GameIdentifier | null> {
		return this.delegate.getCurrentGameId();
	}

}// class

