import { AbstractKeyValueService } from './abstract.key-value.service';


export abstract class AbstractGamesOfScenarioBackEndService extends AbstractKeyValueService<string, string[], void> {

	getAll(): undefined {
		return undefined
	}

	add(_specification: void): undefined {
		return undefined;
	}
	
}
