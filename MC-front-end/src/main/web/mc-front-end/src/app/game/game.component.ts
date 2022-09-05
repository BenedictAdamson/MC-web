import { Observable, combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, first, map, mergeMap, tap } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AbstractSelfService } from '../service/abstract.self.service';
import { Game } from '../game';
import { GameService } from '../service/game.service';
import {ScenarioService} from "../service/scenario.service";
import {Scenario} from "../scenario";

@Component({
   selector: 'app-game',
   templateUrl: './game.component.html',
   styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

   constructor(
      private route: ActivatedRoute,
      private gameService: GameService,
      private scenarioService: ScenarioService,
      private selfService: AbstractSelfService
   ) { }


   private static displayedGameState(state: string): string {
      switch (state) {
         case 'WAITING_TO_START': return 'waiting to start';
         case 'RUNNING': return 'running';
         case 'STOPPED': return 'stopped';
      }
      return '?';// never happens
   }

  get identifier$(): Observable<string> {
    return this.route.paramMap.pipe(
      map(params => params.get('game')),
      filter(identifier => !!identifier),
      map((identifier: string | null) => identifier as string)
    );
  };


   get game$(): Observable<Game> {
      return this.identifier$.pipe(
         mergeMap(identifier => this.gameService.get(identifier)),
         filter(game => !!game),
         map((game: Game | null) => game as Game)
      );
   }

  get scenario$(): Observable<string> {
    return this.game$.pipe(
      map(game => game.scenario),
      distinctUntilChanged() // don't spam identical values
    );
  };

  get scenarioTitle$(): Observable<string> {
    return this.scenario$.pipe(
      mergeMap(identifier => this.scenarioService.get(identifier)),
      filter(scenario => !!scenario),
      map((scenario: Scenario | null) => scenario as Scenario),
      map(scenario => scenario.title),
      distinctUntilChanged() // don't spam identical values
    );
  };

  get created$(): Observable<string> {
    return this.game$.pipe(
      map(game => game.created),
      distinctUntilChanged() // don't spam identical values
    );
  };

   private get runState$(): Observable<string> {
      return this.game$.pipe(
         map(game => game.runState),
         distinctUntilChanged() // don't spam identical values
      );
   };

   get displayedRunState$(): Observable<string> {
      return this.runState$.pipe(
         map(state => GameComponent.displayedGameState(state))
      );
   };

   get mayManageGames$(): Observable<boolean> {
      return this.selfService.mayManageGames$;
   }

   get mayStart$(): Observable<boolean> {
      return combineLatest([this.runState$, this.mayManageGames$]).pipe(
         map(([runState, mayManageGames]) =>
            runState === 'WAITING_TO_START' && mayManageGames
         ),
         distinctUntilChanged() // don't spam identical values
      );
   }

   get mayStop$(): Observable<boolean> {
      return combineLatest([this.runState$, this.mayManageGames$]).pipe(
         map(([runState, mayManageGames]) =>
            runState === 'RUNNING' && mayManageGames
         ),
         distinctUntilChanged() // don't spam identical values
      );
   }

   startGame(): void {
      this.identifier$.pipe(
         first(),// do the operation only once
         tap(id => this.gameService.startGame(id))
      ).subscribe();
   }

   stopGame(): void {
      this.identifier$.pipe(
         first(),// do the operation only once
         tap(id => this.gameService.stopGame(id))
      ).subscribe();
   }

   ngOnInit(): void {
      // Do nothing
   }

}
