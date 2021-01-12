import { Observable, of } from 'rxjs';

import { AbstractScenarioBackEndService } from '../abstract.scenario.back-end.service';
import { Scenario } from '../../scenario';


export class MockScenarioBackEndService extends AbstractScenarioBackEndService {

	constructor(
		public scenarios: Scenario[]
	) {
		super();
	}


	get(id: string): Observable<Scenario | null> {
		for (let scenario of this.scenarios) {
			if (scenario.identifier == id) return of(scenario);
		}
		return of(null);
	}
}

