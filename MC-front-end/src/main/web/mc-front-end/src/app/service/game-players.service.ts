import { Observable, ReplaySubject } from 'rxjs';

import { Injectable } from '@angular/core';

import { AbstractGamePlayersBackEndService } from './abstract.game-players.back-end.service';
import { AbstractSelfService } from './abstract.self.service';
import { CachingKeyValueService } from './caching.key-value.service';
import { GameIdentifier } from '../game-identifier';
import { GamePlayers } from '../game-players';
import { GameService } from './game.service';


@Injectable({
   providedIn: 'root'
})
export class GamePlayersService extends CachingKeyValueService<GameIdentifier, GamePlayers, void> {

   private currentGameId: ReplaySubject<GameIdentifier | null> | null = null;

   constructor(
      private readonly selfService: AbstractSelfService,
      private gamePlayersBackEnd: AbstractGamePlayersBackEndService
   ) {
      super(gamePlayersBackEnd);
   }

   static getApiGamePlayersPath(game: GameIdentifier): string {
      return GameService.getApiGamePath(game) + '/players';
   }

   static getApiJoinGamePath(game: GameIdentifier): string {
      return GamePlayersService.getApiGamePlayersPath(game) + '?join';
   }

   static getApiGameEndRecuitmentPath(game: GameIdentifier): string {
      return GamePlayersService.getApiGamePlayersPath(game) + '?endRecruitment';
   }


   /**
    * Ask that the current user joins the game that has a given ID.
    *
    * Calling this method starts an asynchronous operation to cause the change on the server,
    * which will result in the [[Observable]] returned by [[get(GameIdentifier)]]
    * emitting an updated value for the game players of the given `game`,
    * if server value has changed.
    *
    * @param game
    * The unique ID of the game to join.
    */
   joinGame(game: GameIdentifier): void {
      this.gamePlayersBackEnd.joinGame(game).subscribe(
         gps => {
            this.setValue(gps);
            if (!this.currentGameId) {
               this.currentGameId = new ReplaySubject(1);
            };
            this.currentGameId.next(game);
         }
      );
   }

   getCurrentGameId(): Observable<GameIdentifier | null> {
      if (!this.currentGameId) {
         this.currentGameId = new ReplaySubject(1);
         this.updateCurrentGameIdRS(this.currentGameId);
      };
      // else use currently cached value
      return this.currentGameId.asObservable();
   }

   updateCurrentGameId(): void {
      if (!this.currentGameId) {
         this.currentGameId = new ReplaySubject(1);
      };
      this.updateCurrentGameIdRS(this.currentGameId);
   }


   /**
    * Change a game so it is no longer [[Game.recruiting|recruiting]] players.
    *
    * Calling this method starts an asynchronous operation to cause the change on the server,
    * which will result in the [[Observable]] returned by [[getGamePlayers(GameIdentifier)]]
    * emitting an updated value for the game players of the given `game`,
    * if server value has changed.
    *
    * The operation performs a POST.
    * The server actually replies to the POST with a 302 (Found) redirect
    * to the resource of the altered game players resource.
    * The HttpClient or browser itself handles that redirect for us.
    *
    * @param game
    * The unique ID of the game for which to end recuitment.
    */
   endRecruitment(game: GameIdentifier): void {
      this.gamePlayersBackEnd.endRecruitment(game).subscribe(
         gps => this.setValue(gps)
      );
   }


   protected createKeyString(id: GameIdentifier): string {
      return id.scenario + '/' + id.created;
   }

   protected getKey(value: GamePlayers): GameIdentifier {
      return value.game;
   }


   private updateCurrentGameIdRS(currentGameId: ReplaySubject<GameIdentifier | null>): void {
      this.gamePlayersBackEnd.getCurrentGameId().subscribe(
         g => currentGameId.next(g)
      );
   }
}
