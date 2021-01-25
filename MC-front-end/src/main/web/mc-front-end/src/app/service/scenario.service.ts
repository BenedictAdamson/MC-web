import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

import { AbstractScenarioBackEndService } from './abstract.scenario.back-end.service';
import { CachingKeyValueService } from './caching.key-value.service';
import { NamedUUID } from '../named-uuid';
import { Scenario } from '../scenario';



@Injectable({
	providedIn: 'root'
})
export class ScenarioService extends CachingKeyValueService<string, Scenario, void>  {

	constructor(
		private scenarioBackEnd: AbstractScenarioBackEndService
	) {
		super(scenarioBackEnd);
	}


	getAll(): undefined {
		return undefined;
	}

	add(_specification: void): undefined {
		return undefined;
	}

	getScenarioIdentifiers(): Observable<NamedUUID[]> {
		return this.scenarioBackEnd.getScenarioIdentifiers();
	}


	protected createKeyString(id: string): string {
		return id;
	}

	protected getKey(value: Scenario): string {
		return value.identifier;
	}
}
