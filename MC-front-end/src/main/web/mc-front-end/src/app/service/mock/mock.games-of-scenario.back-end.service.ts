import { Observable, of } from 'rxjs';

import { AbstractGamesOfScenarioBackEndService } from '../abstract.games-of-scenario.back-end.service'
import {GameIdentifier} from "../../game-identifier";

export class MockGamesOfScenarioBackEndService extends AbstractGamesOfScenarioBackEndService {

	constructor(
		private scenario: string,
		private games: GameIdentifier[]
	) {
		super();
	};

	private copy(): Observable<GameIdentifier[]> {
    const result: GameIdentifier[] = [];
    this.games.forEach(game => result.push(game));
		return of(result);
	}


	get(scenario: string): Observable<GameIdentifier[] | null> {
		if (scenario == this.scenario) {
			return this.copy();
		} else {
			return of(null);
		}
	}
}
