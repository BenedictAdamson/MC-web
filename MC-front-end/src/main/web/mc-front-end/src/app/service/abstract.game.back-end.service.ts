import {Observable} from 'rxjs';

import {AbstractKeyValueService} from './abstract.key-value.service';
import {Game} from '../game';


export abstract class AbstractGameBackEndService extends AbstractKeyValueService<string, Game, string> {

  getAll(): undefined {
    return undefined;
  }

  abstract add(scenario: string): Observable<Game>;

  abstract startGame(identifier: string): Observable<Game>;

  abstract stopGame(identifier: string): Observable<Game>;

  abstract joinGame(identifier: string): Observable<Game>;

  abstract endRecruitment(identifier: string): Observable<Game>;

  abstract getCurrentGameId(): Observable<string | null>;

}
