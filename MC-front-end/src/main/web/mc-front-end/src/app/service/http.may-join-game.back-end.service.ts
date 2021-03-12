import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AbstractMayJoinGameBackEndService } from './abstract.may-join-game.back-end.service';
import { GameIdentifier } from '../game-identifier';
import { HttpSimpleKeyValueService } from './http.simple-key-value.service';
import { getApiGamePath } from './http.game.back-end.service';


export function getApiMayJoinGamePath(game: GameIdentifier): string {
	return getApiGamePath(game) + '/players?mayJoin';
}


class Delegate extends HttpSimpleKeyValueService<GameIdentifier, boolean, void, undefined> {

	constructor(
		http: HttpClient
	) {
		super(http, undefined);
	}

	getUrl(id: GameIdentifier): string {
		return getApiMayJoinGamePath(id);
	}

	getAll(): undefined {
		return undefined;
	}

	add(_specification: void): undefined {
		return undefined;
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
export class HttpMayJoinGameBackEndService extends AbstractMayJoinGameBackEndService {

	private delegate: Delegate;


	constructor(
		http: HttpClient
	) {
		super();
		this.delegate = new Delegate(http);
	}

	get(id: GameIdentifier): Observable<boolean | null> {
		return this.delegate.get(id);
	}

}// class

