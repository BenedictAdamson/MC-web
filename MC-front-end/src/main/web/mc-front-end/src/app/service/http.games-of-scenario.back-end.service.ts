import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AbstractGamesOfScenarioBackEndService } from './abstract.games-of-scenario.back-end.service';
import { HttpSimpleKeyValueService } from './http.simple-key-value.service';
import {NamedUUID} from "../named-uuid";



export function getApiGamesOfScenarioPath(scenario: string): string {
	return '/api/scenario/' + scenario + '/games';
}


class Delegate extends HttpSimpleKeyValueService<string, NamedUUID[], void, void> {

	constructor(
		http: HttpClient
	) {
		super(http, undefined);
	}


	getUrl(id: string): string {
		return getApiGamesOfScenarioPath(id);
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


}



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


	get(id: string): Observable<NamedUUID[] | null> {
		return this.delegate.get(id);
	}

}

