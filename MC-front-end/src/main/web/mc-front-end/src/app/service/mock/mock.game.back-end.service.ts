import { Observable, throwError, of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { AbstractGameBackEndService } from '../abstract.game.back-end.service';
import { Game } from '../../game';
import { GameIdentifier } from '../../game-identifier';


export class MockGameBackEndService extends AbstractGameBackEndService {

	private created: number = 0;

	constructor(
		public games: Game[]
	) {
		super();
	}


	get(id: GameIdentifier): Observable<Game | null> {
		for (let game of this.games) {
			if (game.identifier.scenario == id.scenario && game.identifier.created == id.created) return of(game);
		}
		return of(null);
	}

	add(scenario: string): Observable<Game> {
		const id: GameIdentifier = { scenario: scenario, created: '2021-01-01T00:00:00.' + ++this.created };
		const game: Game = { identifier: id };
		this.games.push(game);
		return of(game);

	}
}

