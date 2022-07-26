import { Observable } from 'rxjs';

import { AbstractKeyValueService } from './abstract.key-value.service';
import { Game } from '../game';
import { GameIdentifier } from '../game-identifier';


export abstract class AbstractGameBackEndService extends AbstractKeyValueService<GameIdentifier, Game, string> {

	getAll(): undefined {
		return undefined;
	}

	abstract add(scenario: string): Observable<Game>;

   abstract startGame(identifier: GameIdentifier): Observable<Game>;

   abstract stopGame(identifier: GameIdentifier): Observable<Game>;

}
