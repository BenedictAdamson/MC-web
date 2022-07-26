import { Observable, combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, first, map, mergeMap, tap } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GamePlayersService } from '../service/game-players.service';
import { AbstractSelfService } from '../service/abstract.self.service';
import { GameIdentifier } from '../game-identifier';
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

   private get scenarioId$(): Observable<string> {
      if (!this.route.parent) {
         throw new Error('missing this.route.parent');
      }
      if (!this.route.parent.parent) {
         throw new Error('missing this.route.parent.parent');
      }
      return this.route.parent.parent.paramMap.pipe(
         map(params => params.get('scenario')),
         filter(id => !!id),
         map((id: string | null) => id as string),
         distinctUntilChanged() // don't spam identical values
      );
   };

   private get created$(): Observable<string> {
      if (!this.route.parent) {
         throw new Error('missing this.route.parent');
      }
      return this.route.parent.paramMap.pipe(
         map(params => params.get('created')),
         filter(created => !!created),
         map((created: string | null) => created as string),
         distinctUntilChanged() // don't spam identical values
      );
   };

   constructor(
      private route: ActivatedRoute,
      private gamePlayersService: GamePlayersService,
      private mayJoinGameService: MayJoinGameService,
      private scenarioService: ScenarioService,
      private selfService: AbstractSelfService
   ) {
   }

   static playedCharacters(scenario: Scenario, game: Game): string[] {
      return scenario.characters.filter(c => game.users.has(c.id)).map(c => c.title);
   }

   private static createIdentifier(scenario: string, created: string) {
      return { scenario, created };
   }

   private static isEndRecruitmentDisabled(mayManageGames: boolean, game: Game): boolean {
      return !game || !game.recruiting || !mayManageGames;
   }


   get identifier$(): Observable<GameIdentifier> {
      return combineLatest([this.scenarioId$, this.created$]).pipe(
         map(([scenario, created]) => GamePlayersComponent.createIdentifier(scenario, created)),
         distinctUntilChanged() // don't spam identical values
      );
   };

   get gamePlayers$(): Observable<Game> {
      return this.identifier$.pipe(
         mergeMap(identifier => this.gamePlayersService.get(identifier)),
         filter(gps => !!gps),
         map((gps: Game | null) => gps as Game)
      );
   }

   get scenario$(): Observable<Scenario> {
      return this.scenarioId$.pipe(
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
      return combineLatest([this.selfService.id$, this.gamePlayers$]).pipe(
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
      return combineLatest([this.mayManageGames$, this.gamePlayers$]).pipe(
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
      return this.gamePlayers$.pipe(
         map(gps => gps.recruiting)
      );
   }

  get playedCharacters$(): Observable<string[]> {
      return combineLatest([this.scenario$, this.gamePlayers$]).pipe(
         map(([scenario, gamePlayers]) => GamePlayersComponent.playedCharacters(scenario, gamePlayers))
      );
   }

   endRecruitment() {
      this.identifier$.pipe(
         first(),// do the operation only once
         tap(id => this.gamePlayersService.endRecruitment(id))
      ).subscribe();
   }

   joinGame() {
      this.identifier$.pipe(
         first(),// do the operation only once
         tap(id => this.gamePlayersService.joinGame(id))
      ).subscribe();
   }

}
