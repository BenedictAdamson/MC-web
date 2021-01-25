import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AbstractGamePlayersBackEndService } from './abstract.game-players.back-end.service';
import { GameIdentifier } from '../game-identifier';
import { GamePlayers } from '../game-players';
import { HttpKeyValueService } from './http.key-value.service';
import { getApiGamePath } from './http.game.back-end.service';



export function getApiGamePlayersPath(game: GameIdentifier): string {
	return getApiGamePath(game) + '/players';
}

export function getApiJoinGamePath(game: GameIdentifier): string {
	return getApiGamePlayersPath(game) + '?join';
}

export function getApiGameEndRecuitmentPath(game: GameIdentifier): string {
	return getApiGamePlayersPath(game) + '?endRecruitment';
}



class Delegate extends HttpKeyValueService<GameIdentifier, GamePlayers, void, void> {

	constructor(
		http: HttpClient
	) {
		super(http, undefined);
	}


	getUrl(id: GameIdentifier): string {
		return getApiGamePlayersPath(id);
	}

	getAll(): undefined {
		return undefined;
	}

	add(_specification: void): undefined {
		return undefined;
	}

	joinGame(game: GameIdentifier): Observable<GamePlayers> {
		return this.http.post<GamePlayers>(getApiJoinGamePath(game), "");
	}

	endRecruitment(game: GameIdentifier): Observable<GamePlayers> {
		return this.http.post<GamePlayers>(getApiGameEndRecuitmentPath(game), "");
	}


	protected getAddUrl(_specification: void): undefined {
		return undefined;
	}

	protected getAddPayload(_specification: void): undefined {
		return undefined;
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
		this.delegate = new Delegate(http)
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

}// class

