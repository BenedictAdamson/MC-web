import { Observable } from 'rxjs';
import { filter, first, map, mergeMap, tap } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AbstractSelfService } from '../service/abstract.self.service';
import { GameIdentifier } from '../game-identifier';
import { GameService } from '../service/game.service';
import { GamesOfScenarioService } from '../service/games-of-scenario.service';

@Component({
   selector: 'app-scenario',
   templateUrl: './games.component.html',
   styleUrls: ['./games.component.css']
})
export class GamesComponent implements OnInit {

   constructor(
      private route: ActivatedRoute,
      private readonly router: Router,
      private selfService: AbstractSelfService,
      private gameService: GameService,
      private gamesOfScenarioService: GamesOfScenarioService
   ) { }

   static getGamePagePath(game: GameIdentifier) {
      return '/scenario/' + game.scenario + '/game/' + game.created;
   }

   get scenario$(): Observable<string> {
      if (!this.route.parent) {
         throw new Error('missing this.route.parent');
      }
      return this.route.parent.paramMap.pipe(
         map(params => params.get('scenario')),
         filter(scenario => !!scenario),
         map((scenario: string | null) => scenario as string)
      );
   }

   get games$(): Observable<GameIdentifier[]> {
      return this.scenario$.pipe(
         mergeMap(scenario => this.gamesOfScenarioService.get(scenario)),
         map((games: GameIdentifier[] | null) => {
            if (games) {
               return games;
            } else {
               return [];
            }
         })
      );
   }

   ngOnInit() {
      this.scenario$.pipe(
         tap(scenario => this.gamesOfScenarioService.update(scenario))
      ).subscribe();
   }

   get mayExamineGame$(): Observable<boolean> {
      return this.selfService.mayExamineGame$;
   }

   /**
    * @description
    * Whether the current user does not have permission to create games.
    *
    * A user that has not been authenticated does not have that permission.
    */
   get isDisabledCreateGame$(): Observable<boolean> {
      return this.selfService.mayManageGames$.pipe(
         map(mayManage => !mayManage)
      );
   }

   /**
    * Attempts to create a new game for the scenario of this games list.
    * On completion, redirects to the game page for that game.
    */
   createGame(): void {
      this.scenario$.pipe(
         first(),// create only 1 game
         mergeMap(scenario => this.gameService.createGame(scenario)),
         map(game => game.identifier),
         tap(gameIdentifier => {
            this.gamesOfScenarioService.update(gameIdentifier.scenario);
            this.router.navigateByUrl(GamesComponent.getGamePagePath(gameIdentifier));
         })
      ).subscribe();
   }
}
