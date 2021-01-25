import { Observable } from 'rxjs';

import { AbstractKeyValueService } from './abstract.key-value.service';
import { GameIdentifier } from '../game-identifier';
import { GamePlayers } from '../game-players';


export abstract class AbstractGamePlayersBackEndService extends AbstractKeyValueService<GameIdentifier, GamePlayers, void> {

	getAll(): undefined {
		return undefined
	}

	abstract get(id: GameIdentifier): Observable<GamePlayers | null>;

	add(_specification: void): undefined {
		return undefined;
	}

	abstract joinGame(game: GameIdentifier): Observable<GamePlayers>;

	abstract endRecruitment(game: GameIdentifier): Observable<GamePlayers>;
}
