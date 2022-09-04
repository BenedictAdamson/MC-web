import { Injectable } from '@angular/core';

import { AbstractGamesOfScenarioBackEndService } from './abstract.games-of-scenario.back-end.service';
import { CachingKeyValueService } from './caching.key-value.service';
import { GameIdentifier } from '../game-identifier';



export function getApiGamesOfScenarioPath(scenario: string): string {
	return '/api/scenario/' + scenario + '/games';
}


@Injectable({
	providedIn: 'root'
})
export class GamesOfScenarioService extends CachingKeyValueService<string, GameIdentifier[], void> {

	constructor(
		backEnd: AbstractGamesOfScenarioBackEndService
	) {
		super(backEnd);
	}


	protected createKeyString(id: string): string {
		return id;
	}

	protected getKey(_value: GameIdentifier[]): undefined {
		return undefined;
	}

}
