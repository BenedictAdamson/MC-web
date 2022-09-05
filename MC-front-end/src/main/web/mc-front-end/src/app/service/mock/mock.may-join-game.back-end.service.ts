import { Observable,  of } from 'rxjs';
import { AbstractMayJoinGameBackEndService } from '../abstract.may-join-game.back-end.service';


export class MockMayJoinGameBackEndService extends AbstractMayJoinGameBackEndService {

	constructor(
		private may: boolean
	) {
		super();
	}

	get(_id: string): Observable<boolean | null> {
		return of(this.may);
	}
}

