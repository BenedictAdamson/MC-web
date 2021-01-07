import { Observable, of } from 'rxjs';

import { AbstractMayJoinGameService } from '../abstract.may-join-game.service'
import { GameIdentifier } from '../../game-identifier'

export class MockGamePlayersService extends AbstractMayJoinGameService {

	constructor(
		private mayJoinServer: boolean
	) {
		super();
	};

	protected fetchMayJoin(_game: GameIdentifier): Observable<boolean> {
		return of(this.mayJoinServer);
	}
}
