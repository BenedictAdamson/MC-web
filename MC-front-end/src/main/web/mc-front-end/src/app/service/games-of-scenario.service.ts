import { Injectable } from '@angular/core';

import { AbstractGamesOfScenarioBackEndService } from './abstract.games-of-scenario.back-end.service';
import { CachingKeyValueService } from './caching.key-value.service';
import {NamedUUID} from "../named-uuid";



export function getApiGamesOfScenarioPath(scenario: string): string {
	return '/api/scenario/' + scenario + '/games';
}


@Injectable({
	providedIn: 'root'
})
export class GamesOfScenarioService extends CachingKeyValueService<string, NamedUUID[], void> {

	constructor(
		backEnd: AbstractGamesOfScenarioBackEndService
	) {
		super(backEnd);
	}


	protected createKeyString(id: string): string {
		return id;
	}

	protected getKey(value: NamedUUID[]): undefined {
		return undefined;
	}

}
