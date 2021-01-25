import { Injectable } from '@angular/core';

import { AbstractGamesOfScenarioBackEndService } from './abstract.games-of-scenario.back-end.service';
import { CachingKeyValueService } from './caching.key-value.service';
import { GameIdentifier } from '../game-identifier';



export function getApiGamesPath(scenario: string): string {
	return '/api/scenario/' + scenario + '/game/';
}

export function getApiGamePath(id: GameIdentifier): string {
	return getApiGamesPath(id.scenario) + id.created;
}


@Injectable({
	providedIn: 'root'
})
export class GamesOfScenarioService extends CachingKeyValueService<string, string[], void> {

	constructor(
		backEnd: AbstractGamesOfScenarioBackEndService
	) {
		super(backEnd);
	}


	protected createKeyString(id: string): string {
		return id;
	}

	protected getKey(_value: string[]): undefined {
		return undefined;
	}

}
