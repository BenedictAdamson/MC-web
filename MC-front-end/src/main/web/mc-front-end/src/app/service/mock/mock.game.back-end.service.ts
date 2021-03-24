import { Observable, of, throwError } from 'rxjs';

import { AbstractGameBackEndService } from '../abstract.game.back-end.service';
import { Game } from '../../game';
import { GameIdentifier } from '../../game-identifier';


export class MockGameBackEndService extends AbstractGameBackEndService {

   private created = 0;

   constructor(
      public games: Game[]
   ) {
      super();
   }


   get(id: GameIdentifier): Observable<Game | null> {
      for (const game of this.games) {
         if (game.identifier.scenario === id.scenario && game.identifier.created === id.created) { return of(game); }
      }
      return of(null);
   }

   add(scenario: string): Observable<Game> {
      const id: GameIdentifier = { scenario, created: '2021-01-01T00:00:00.' + ++this.created };
      const game: Game = { identifier: id, runState: 'WAITIBG_TO_START' };
      this.games.push(game);
      return of(game);
   }

   startGame(id: GameIdentifier): Observable<Game> {
      for (const game of this.games) {
         if (game.identifier.scenario === id.scenario && game.identifier.created === id.created) {
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
}

