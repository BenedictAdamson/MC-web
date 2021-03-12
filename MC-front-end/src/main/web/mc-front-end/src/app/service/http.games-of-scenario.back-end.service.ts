import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AbstractGamesOfScenarioBackEndService } from './abstract.games-of-scenario.back-end.service';
import { HttpSimpleKeyValueService } from './http.simple-key-value.service';



export function getApiGamesPath(scenario: string): string {
	return '/api/scenario/' + scenario + '/game/';
}


class Delegate extends HttpSimpleKeyValueService<string, string[], void, void> {

	constructor(
		http: HttpClient
	) {
		super(http, undefined);
	}


	getUrl(id: string): string {
		return getApiGamesPath(id);
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
export class HttpGamesOfScenarioBackEndService extends AbstractGamesOfScenarioBackEndService {

	private delegate: Delegate;


	constructor(
		http: HttpClient
	) {
		super();
		this.delegate = new Delegate(http);
	}


	get(id: string): Observable<string[] | null> {
		return this.delegate.get(id);
	}

}// class

