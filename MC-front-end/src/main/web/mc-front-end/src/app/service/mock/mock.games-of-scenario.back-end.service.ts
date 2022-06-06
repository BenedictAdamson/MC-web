import { Observable, of } from 'rxjs';

import { AbstractGamesOfScenarioBackEndService } from '../abstract.games-of-scenario.back-end.service'

export class MockGamesOfScenarioBackEndService extends AbstractGamesOfScenarioBackEndService {

	constructor(
		private scenario: string,
		private games: string[]
	) {
		super();
	};

	private copy(): Observable<string[]> {
    const result: string[] = [];
    this.games.forEach(game => result.push(game));
		return of(result);
	}


	get(scenario: string): Observable<string[] | null> {
		if (scenario == this.scenario) {
			return this.copy();
		} else {
			return of(null);
		}
	}
}
