import { Observable, combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, first, map, mergeMap, tap } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GameService } from '../service/game.service';
import { AbstractSelfService } from '../service/abstract.self.service';
import { Game } from '../game';
import { MayJoinGameService } from '../service/may-join-game.service';
import { Scenario } from '../scenario';
import { ScenarioService } from '../service/scenario.service';

@Component({
   selector: 'app-game',
   templateUrl: './game-players.component.html',
   styleUrls: ['./game-players.component.css']
})
export class GamePlayersComponent implements OnInit {

   constructor(
      private route: ActivatedRoute,
      private gameService: GameService,
      private mayJoinGameService: MayJoinGameService,
      private scenarioService: ScenarioService,
      private selfService: AbstractSelfService
   ) {
   }

   static playedCharacters(scenario: Scenario, game: Game): string[] {
      return scenario.characters.filter(c => game.users.has(c.id)).map(c => c.title);
   }

   private static isEndRecruitmentDisabled(mayManageGames: boolean, game: Game): boolean {
      return !game || !game.recruiting || !mayManageGames;
   }


   get identifier$(): Observable<string> {
     return this.route.paramMap.pipe(
       map(params => params.get('game')),
       filter(identifier => !!identifier),
       map((identifier: string | null) => identifier as string),
       distinctUntilChanged() // don't spam identical values
     );
   };

   get game$(): Observable<Game> {
      return this.identifier$.pipe(
         mergeMap(identifier => this.gameService.get(identifier)),
         filter(gps => !!gps),
         map((gps: Game | null) => gps as Game)
      );
   }

   get scenario$(): Observable<Scenario> {
      return this.game$.pipe(
         map(game => game.scenario),
         distinctUntilChanged(),
         mergeMap(id => this.scenarioService.get(id)),
         filter(scenario => !!scenario),
         map((scenario: Scenario | null) => scenario as Scenario)
      );
   };

   ngOnInit(): void {
      // Do nothing
   }

   get mayManageGames$(): Observable<boolean> {
      return this.selfService.mayManageGames$;
   }

   private get characterOfUser$(): Observable<string | null> {
      return combineLatest([this.selfService.id$, this.game$]).pipe(
         map(([id, gamePlayers]) => id ? gamePlayers.characterOfUser(id) : null),
         distinctUntilChanged() // don't spam identical values
      );
   }

   get characterNameForUser$(): Observable<string> {
      return combineLatest([this.characterOfUser$, this.scenario$]).pipe(
         map(([character, scenario]) => character ? scenario.characterWithId(character) : null),
         filter(c => !!c),
         map(c => c as string),
         distinctUntilChanged() // don't spam identical values
      );
   }

   get playing$(): Observable<boolean> {
      return this.characterOfUser$.pipe(
         map(c => c != null),
         distinctUntilChanged() // don't spam identical values
      );
   }

   get isEndRecruitmentDisabled$(): Observable<boolean> {
      return combineLatest([this.mayManageGames$, this.game$]).pipe(
         map(([mayManageGames, gamePlayers]) => GamePlayersComponent.isEndRecruitmentDisabled(mayManageGames, gamePlayers))
      );
   }

   get mayJoinGame$(): Observable<boolean> {
      return this.identifier$.pipe(
         mergeMap(identifier => this.mayJoinGameService.get(identifier)),
         filter((may: boolean | null) => may != null),
         map(may => may as boolean),
         distinctUntilChanged() // don't spam identical values
      );
   }

   get recruiting$(): Observable<boolean> {
      return this.game$.pipe(
         map(gps => gps.recruiting)
      );
   }

  get playedCharacters$(): Observable<string[]> {
      return combineLatest([this.scenario$, this.game$]).pipe(
         map(([scenario, gamePlayers]) => GamePlayersComponent.playedCharacters(scenario, gamePlayers))
      );
   }

   endRecruitment() {
      this.identifier$.pipe(
         first(),// do the operation only once
         tap(id => this.gameService.endRecruitment(id))
      ).subscribe();
   }

   joinGame() {
      this.identifier$.pipe(
         first(),// do the operation only once
         tap(id => this.gameService.joinGame(id))
      ).subscribe();
   }

}
