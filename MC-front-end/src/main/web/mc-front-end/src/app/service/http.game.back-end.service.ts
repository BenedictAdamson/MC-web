import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AbstractGameBackEndService } from './abstract.game.back-end.service';
import { HttpKeyValueService } from './http.key-value.service';
import { Game } from '../game';
import { GameIdentifier } from '../game-identifier';


const apiScenariosPath: string = '/api/scenario/';

export function getApiGamesPath(scenario: string): string {
	return apiScenariosPath + scenario + '/game/';
}

export function getApiGamePath(id: GameIdentifier): string {
	return getApiGamesPath(id.scenario) + id.created;
}


class Delegate extends HttpKeyValueService<GameIdentifier, Game, string, null> {

	constructor(
		http: HttpClient
	) {
		super(http, undefined);
	}


	getUrl(id: GameIdentifier): string {
		return getApiGamePath(id);
	}

	getAll(): undefined {
		return undefined;
	}


	protected getAddUrl(scenario: string): string {
		return getApiGamesPath(scenario);
	}

	protected getAddPayload(_scenario: string): null {
		return null;
	}

}// class


@Injectable({
	providedIn: 'root'
})
export class HttpGameBackEndService extends AbstractGameBackEndService {

	private delegate: Delegate;


	constructor(
		http: HttpClient
	) {
		super();
		this.delegate = new Delegate(http)
	}


	getAll(): undefined {
		return undefined;
	}

	get(id: GameIdentifier): Observable<Game | null> {
		return this.delegate.get(id);
	}

	add(scenario: string): Observable<Game> {
		return this.delegate.add(scenario) as Observable<Game>;
	}

}// class

