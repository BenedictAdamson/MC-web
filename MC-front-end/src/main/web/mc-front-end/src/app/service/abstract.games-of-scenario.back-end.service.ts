import { AbstractKeyValueService } from './abstract.key-value.service';
import {GameIdentifier} from "../game-identifier";
import {NamedUUID} from "../named-uuid";


export abstract class AbstractGamesOfScenarioBackEndService extends AbstractKeyValueService<string, NamedUUID[], void> {

	getAll(): undefined {
		return undefined
	}

	add(_specification: void): undefined {
		return undefined;
	}

}
