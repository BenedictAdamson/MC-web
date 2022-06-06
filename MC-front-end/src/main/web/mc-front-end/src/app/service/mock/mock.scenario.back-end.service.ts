import { Observable, of } from 'rxjs';

import { AbstractScenarioBackEndService } from '../abstract.scenario.back-end.service';
import { NamedUUID } from '../../named-uuid';
import { Scenario } from '../../scenario';


export class MockScenarioBackEndService extends AbstractScenarioBackEndService {

	constructor(
		public scenarios: Scenario[]
	) {
		super();
	}


	get(id: string): Observable<Scenario | null> {
		for (const scenario of this.scenarios) {
			if (scenario.identifier === id) {
				return of(scenario);
			}
		}
		return of(null);
	}

	getScenarioIdentifiers(): Observable<NamedUUID[]> {
		const result: NamedUUID[] = [];
		for (const scenario of this.scenarios) {
			const namedId: NamedUUID = { id: scenario.identifier, title: scenario.title };
			result.push(namedId);
		}
		return of(result);
	}
}

