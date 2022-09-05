import { Observable, of } from 'rxjs';

import { AbstractGamesOfScenarioBackEndService } from '../abstract.games-of-scenario.back-end.service'
import {NamedUUID} from "../../named-uuid";

export class MockGamesOfScenarioBackEndService extends AbstractGamesOfScenarioBackEndService {

	constructor(
		private scenario: string,
		private games: NamedUUID[]
	) {
		super();
	};

	private copy(): Observable<NamedUUID[]> {
    const result: NamedUUID[] = [];
    this.games.forEach(game => result.push(game));
		return of(result);
	}


	get(scenario: string): Observable<NamedUUID[] | null> {
		if (scenario == this.scenario) {
			return this.copy();
		} else {
			return of(null);
		}
	}
}
