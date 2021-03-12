import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AbstractGamePlayersBackEndService } from './abstract.game-players.back-end.service';
import { GameIdentifier } from '../game-identifier';
import { GamePlayers } from '../game-players';
import { HttpKeyValueService } from './http.key-value.service';
import { getApiGamePath } from './http.game.back-end.service';



class Delegate extends HttpKeyValueService<GameIdentifier, GamePlayers, void, void> {

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
		return this.http.post<GamePlayers>(HttpGamePlayersBackEndService.getApiJoinGamePath(game), '');
	}

	endRecruitment(game: GameIdentifier): Observable<GamePlayers> {
		return this.http.post<GamePlayers>(HttpGamePlayersBackEndService.getApiGameEndRecuitmentPath(game), '');
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
		this.delegate = new Delegate(http);
	}

	static getApiGamePlayersPath(game: GameIdentifier): string {
		return getApiGamePath(game) + '/players';
	}

	static getApiJoinGamePath(game: GameIdentifier): string {
		return HttpGamePlayersBackEndService.getApiGamePlayersPath(game) + '?join';
	}

	static getApiGameEndRecuitmentPath(game: GameIdentifier): string {
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

}// class

