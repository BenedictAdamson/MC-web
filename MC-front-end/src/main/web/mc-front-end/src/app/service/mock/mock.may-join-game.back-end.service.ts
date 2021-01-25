import { Observable,  of } from 'rxjs';
import { AbstractMayJoinGameBackEndService } from '../abstract.may-join-game.back-end.service';
import { GameIdentifier } from '../../game-identifier'


export class MockMayJoinGameBackEndService extends AbstractMayJoinGameBackEndService {

	constructor(
		private may: boolean
	) {
		super();
	}

	get(_id: GameIdentifier): Observable<boolean | null> {
		return of(this.may);
	}
}

