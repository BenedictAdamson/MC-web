import {Observable, of, throwError} from 'rxjs';

import {AbstractGameBackEndService} from '../abstract.game.back-end.service';
import {Game} from '../../game';
import {v4 as uuid} from "uuid";


export class MockGameBackEndService extends AbstractGameBackEndService {


  private created = 0;

  constructor(
    public games: Game[],
    private selfId: string
  ) {
    super();
  }


  get(id: string): Observable<Game | null> {
    for (const game of this.games) {
      if (game.identifier === id) {
        return of(game);
      }
    }
    return of(null);
  }

  add(scenario: string): Observable<Game> {
    const identifier: string = uuid();
    const characterIdA: string = uuid();
    const characterIdB: string = uuid();
    const userIdA: string = uuid();
    const userIdB: string = uuid();
    const users: Map<string, string> = new Map([
      [characterIdA, userIdA],
      [characterIdB, userIdB]
    ]);
    const game: Game = new Game(identifier, scenario, '2021-01-01T00:00:00.' + ++this.created, 'WAITING_TO_START', true, users);
    this.games.push(game);
    return of(game);
  }

  startGame(id: string): Observable<Game> {
    for (const game of this.games) {
      if (game.identifier === id) {
        switch (game.runState) {
          case 'WAITING_TO_START':
            game.runState = 'RUNNING';
            return of(game);
          case 'RUNNING':
            return of(game);
          case 'STOPPED':
            return throwError('Conflict');
        }
        return of(game);
      }
    }
    return throwError('Not Found');
  }

  stopGame(id: string): Observable<Game> {
    for (const game of this.games) {
      if (game.identifier === id) {
        switch (game.runState) {
          case 'WAITING_TO_START':
          case 'RUNNING':
            game.runState = 'STOPPED';
            return of(game);
          case 'STOPPED':
            return of(game);
        }
        return of(game);
      }
    }
    return throwError('Not Found');
  }

  joinGame(id: string): Observable<Game> {
    for (const game of this.games) {
      if (game.identifier === id) {
        if (!game.isPlaying(this.selfId)) {
          game.users.set('FIXME', this.selfId);
        }
        return of(game);
      }
    }
    return throwError('Not Found');
  }

  endRecruitment(id: string): Observable<Game> {
    for (const game of this.games) {
      if (game.identifier === id) {
        game.recruiting = false;
        return of(game);
      }
    }
    return throwError('Not Found');
  }

  getCurrentGameId(): Observable<string | null> {
    if (this.games.length == 0) {
      return of(null)
    } else {
      return of(this.games[0].identifier);
    }
  }
}

