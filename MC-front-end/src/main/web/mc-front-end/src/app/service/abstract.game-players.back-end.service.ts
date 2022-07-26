import { Observable } from 'rxjs';

import { AbstractKeyValueService } from './abstract.key-value.service';
import { GameIdentifier } from '../game-identifier';
import { Game } from '../game';


export abstract class AbstractGamePlayersBackEndService extends AbstractKeyValueService<GameIdentifier, Game, void> {

	getAll(): undefined {
		return undefined;
	}

	add(_specification: void): undefined {
		return undefined;
	}

	abstract get(id: GameIdentifier): Observable<Game | null>;

	abstract joinGame(identifier: GameIdentifier): Observable<Game>;

	abstract endRecruitment(identifier: GameIdentifier): Observable<Game>;

	abstract getCurrentGameId(): Observable<GameIdentifier|null>;
}
