import { Observable } from 'rxjs';

import { AbstractKeyValueService } from './abstract.key-value.service';
import { GameIdentifier } from '../game-identifier';
import { GamePlayers } from '../game-players';


export abstract class AbstractGamePlayersBackEndService extends AbstractKeyValueService<GameIdentifier, GamePlayers, void> {

	getAll(): undefined {
		return undefined;
	}

	add(_specification: void): undefined {
		return undefined;
	}

	abstract get(id: GameIdentifier): Observable<GamePlayers | null>;

	abstract joinGame(game: GameIdentifier): Observable<GamePlayers>;

	abstract endRecruitment(game: GameIdentifier): Observable<GamePlayers>;

	abstract getCurrentGameId(): Observable<GameIdentifier|null>;
}
