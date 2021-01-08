import { AbstractKeyValueService } from './abstract.key-value.service';
import { GameIdentifier } from '../game-identifier'


export abstract class AbstractMayJoinGameBackEndService extends AbstractKeyValueService<GameIdentifier, boolean, void> {

	getAll(): undefined {
		return undefined;
	}

	add(_specification: void): undefined {
		return undefined;
	}

}
