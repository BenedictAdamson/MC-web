import { Injectable } from '@angular/core';

import { AbstractMayJoinGameBackEndService } from './abstract.may-join-game.back-end.service';
import { CachingKeyValueService } from './caching.key-value.service';
import { GameIdentifier } from '../game-identifier'
import { GameService } from './game.service'


@Injectable({
	providedIn: 'root'
})
export class MayJoinGameService extends CachingKeyValueService<GameIdentifier, boolean, void> {

	static getApiGamePlayersPath(game: GameIdentifier): string {
		return GameService.getApiGamePath(game) + '/players';
	}

	static getApiMayJoinGamePath(game: GameIdentifier): string {
		return MayJoinGameService.getApiGamePlayersPath(game) + '?mayJoin';
	}


	constructor(
		backEnd: AbstractMayJoinGameBackEndService
	) {
		super(backEnd);
	}


	protected createKeyString(id: GameIdentifier): string {
		return id.scenario + '/' + id.created;
	}

	protected getKey(_value: boolean): undefined {
		return undefined;
	}

}
