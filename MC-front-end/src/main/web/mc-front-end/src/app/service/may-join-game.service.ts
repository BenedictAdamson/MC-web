import {Injectable} from '@angular/core';

import {AbstractMayJoinGameBackEndService} from './abstract.may-join-game.back-end.service';
import {CachingKeyValueService} from './caching.key-value.service';
import {GameService} from './game.service'


@Injectable({
	providedIn: 'root'
})
export class MayJoinGameService extends CachingKeyValueService<string, boolean, void> {
  static getApiMayJoinGamePath(game: string): string {
		return GameService.getApiGamePath(game) + '?mayJoin';
	}


	constructor(
		backEnd: AbstractMayJoinGameBackEndService
	) {
		super(backEnd);
	}


	protected createKeyString(id: string): string {
		return id;
	}

	protected getKey(_value: boolean): undefined {
		return undefined;
	}

}
