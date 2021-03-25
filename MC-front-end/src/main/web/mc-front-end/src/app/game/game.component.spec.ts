import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { AbstractGameBackEndService } from '../service/abstract.game.back-end.service';
import { AbstractSelfService } from '../service/abstract.self.service';
import { Game } from '../game';
import { GameIdentifier } from '../game-identifier';
import { GameComponent } from './game.component';
import { User } from '../user';

import { MockGameBackEndService } from '../service/mock/mock.game.back-end.service';
import { MockSelfService } from '../service/mock/mock.self.service';


describe('GameComponent', () => {
   let component: GameComponent;
   let fixture: ComponentFixture<GameComponent>;
   let selfService: AbstractSelfService;

   const USER_ID_A: string = uuid();
   const USER_ID_B: string = uuid();
   const USER_ADMIN: User = { id: USER_ID_A, username: 'Allan', password: null, authorities: ['ROLE_MANAGE_GAMES'] };
   const USER_PLAYER: User = { id: USER_ID_B, username: 'Benedict', password: null, authorities: ['ROLE_PLAYER'] };

   const SCENARIO_ID_A: string = uuid();
   const SCENARIO_ID_B: string = uuid();
   const CREATED_A = '1970-01-01T00:00:00.000Z';
   const CREATED_B = '2020-12-31T23:59:59.999Z';
   const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_ID_A, created: CREATED_A };
   const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_ID_B, created: CREATED_B };



   const getGame = (gc: GameComponent): Game | null => {
      let game: Game | null = null;
      gc.game$.subscribe({
         next: (g) => game = g,
         error: (err) => fail(err),
         complete: () => { }
      });
      return game;
   };

   const getMayManageGames = (gc: GameComponent): boolean => {
      let may = false;
      gc.mayManageGames$.subscribe({
         next: (m) => may = m,
         error: (err) => fail(err),
         complete: () => { }
      });
      return may;
   };

   const getMayStart = (gc: GameComponent): boolean => {
      let may = false;
      gc.mayStart$.subscribe({
         next: (m) => may = m,
         error: (err) => fail(err),
         complete: () => { }
      });
      return may;
   };

   const getMayStop = (gc: GameComponent): boolean => {
      let may = false;
      gc.mayStop$.subscribe({
         next: (m) => may = m,
         error: (err) => fail(err),
         complete: () => { }
      });
      return may;
   };


   const setUp = (self: User, game: Game) => {
      const gameServiceStub: AbstractGameBackEndService = new MockGameBackEndService([game]);
      selfService = new MockSelfService(self);

      const identifier: GameIdentifier = game.identifier;
      TestBed.configureTestingModule({
         declarations: [GameComponent],
         providers: [{
            provide: ActivatedRoute,
            useValue: {
               parent: {
                  paramMap: of(convertToParamMap({ scenario: identifier.scenario }))
               },
               paramMap: of(convertToParamMap({ created: identifier.created }))
            }
         },
         { provide: AbstractGameBackEndService, useValue: gameServiceStub },
         { provide: AbstractSelfService, useValue: selfService }
         ]
      });

      fixture = TestBed.createComponent(GameComponent);
      component = fixture.componentInstance;
      selfService = TestBed.inject(AbstractSelfService);
      selfService.checkForCurrentAuthentication().subscribe();
      fixture.detectChanges();
   };


   const assertInvariants = () => {
      expect(component).toBeTruthy();

      const html: HTMLElement = fixture.nativeElement;
      const selfLink: HTMLAnchorElement | null = html.querySelector('a#game');
      const runState: HTMLElement | null = html.querySelector('#run-state');

      expect(selfLink).withContext('self link').not.toBeNull();
      expect(runState).withContext('run-state element').not.toBeNull();
   };


   const canCreate = (self: User, gameIdentifier: GameIdentifier, runState: string,
      expectedRunStateText: string, expectMayManageGames: boolean, expectMayStart: boolean, expectMayStop: boolean) => {
      const game: Game = { identifier: gameIdentifier, runState };
      setUp(self, game);
      tick();
      fixture.detectChanges();

      assertInvariants();

      expect(getGame(component)).withContext('game').toBe(game);
      expect(getMayManageGames(component)).withContext('mayManageGames').toEqual(expectMayManageGames);
      expect(getMayStart(component)).withContext('mayStart').toEqual(expectMayStart);
      expect(getMayStop(component)).withContext('mayStop').toEqual(expectMayStop);

      const html: HTMLElement = fixture.nativeElement;
      const runStateElement: HTMLElement | null = html.querySelector('#run-state');
      const startButton: HTMLButtonElement | null = html.querySelector('button#start');
      const stopButton: HTMLButtonElement | null = html.querySelector('button#stop');

      expect(runStateElement).withContext('run-state element').not.toBeNull();
      expect(startButton != null).withContext('has start button').toEqual(expectMayStart);
      expect(stopButton != null).withContext('has stop button').toEqual(expectMayStop);

      const displayText: string = html.innerText;
      const runStateText: string | null = runStateElement ? runStateElement.innerText : null;
      const startButtonText: string | null = startButton ? startButton.innerText : null;
      const stopButtonText: string | null = stopButton ? stopButton.innerText : null;

      expect(displayText.includes(game.identifier.created))
         .withContext('The game page includes the date and time that the game was set up').toBeTrue();
      expect(runStateText)
         .withContext('Run-state text').toEqual(expectedRunStateText);
      if (expectMayStart) {
         expect(startButtonText)
            .withContext('Start-button text text').toEqual('Start');
      }
      if (expectMayStop) {
         expect(stopButtonText)
            .withContext('Stop-button text text').toEqual('Stop');
      }
   };

   it('can create [admin, waiting to start]', fakeAsync(() => {
      canCreate(USER_ADMIN, GAME_IDENTIFIER_A, 'WAITING_TO_START', 'waiting to start', true, true, false);
   }));

   it('can create [player, waiting to start]', fakeAsync(() => {
      canCreate(USER_PLAYER, GAME_IDENTIFIER_B, 'WAITING_TO_START', 'waiting to start', false, false, false);
   }));

   it('can create [admin, running]', fakeAsync(() => {
      canCreate(USER_ADMIN, GAME_IDENTIFIER_A, 'RUNNING', 'running', true, false, true);
   }));

   it('can create [player, running]', fakeAsync(() => {
      canCreate(USER_PLAYER, GAME_IDENTIFIER_A, 'RUNNING', 'running', false, false, false);
   }));

   it('can create [admin, stopped]', fakeAsync(() => {
      canCreate(USER_ADMIN, GAME_IDENTIFIER_A, 'STOPPED', 'stopped', true, false, false);
   }));

   it('can create [player, stopped]', fakeAsync(() => {
      canCreate(USER_PLAYER, GAME_IDENTIFIER_A, 'STOPPED', 'stopped', false, false, false);
   }));

});
