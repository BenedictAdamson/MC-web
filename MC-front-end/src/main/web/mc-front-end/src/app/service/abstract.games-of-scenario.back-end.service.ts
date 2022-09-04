import { AbstractKeyValueService } from './abstract.key-value.service';
import {GameIdentifier} from "../game-identifier";


export abstract class AbstractGamesOfScenarioBackEndService extends AbstractKeyValueService<string, GameIdentifier[], void> {

	getAll(): undefined {
		return undefined
	}

	add(_specification: void): undefined {
		return undefined;
	}

}
