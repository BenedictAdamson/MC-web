import { Observable } from 'rxjs';

import { AbstractKeyValueService } from './abstract.key-value.service';
import { NamedUUID } from '../named-uuid';
import { Scenario } from '../scenario';


export abstract class AbstractScenarioBackEndService extends AbstractKeyValueService<string, Scenario, void> {

	getAll(): undefined {
		return undefined;
	}

	add(_scenario: void): undefined {
		return undefined;
	}

	abstract getScenarioIdentifiers(): Observable<NamedUUID[]>;

}
