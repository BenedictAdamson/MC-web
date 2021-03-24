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
   const GAME_A: Game = { identifier: GAME_IDENTIFIER_A, runState: 'WAITING_TO_START' };
   const GAME_B: Game = { identifier: GAME_IDENTIFIER_B, runState: 'RUNNING' };
   const GAME_C: Game = { identifier: GAME_IDENTIFIER_A, runState: 'STOPPED' };



   const getGame = (gc: GameComponent): Game | null => {
      let game: Game | null = null;
      gc.game$.subscribe({
         next: (g) => game = g,
         error: (err) => fail(err),
         complete: () => { }
      });
      return game;
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


   const canCreate = (self: User, game: Game, expectedRunStateText: string) => {
      setUp(self, game);
      tick();
      fixture.detectChanges();

      assertInvariants();

      expect(getGame(component)).withContext('game').toBe(game);

      const html: HTMLElement = fixture.nativeElement;
      const runState: HTMLElement | null = html.querySelector('#run-state');
      const displayText: string = html.innerText;
      const runStateText: string | null = runState ? runState.innerText : null;

      expect(displayText.includes(game.identifier.created))
         .withContext('The game page includes the date and time that the game was set up').toBeTrue();
      expect(runStateText)
         .withContext('Run-state text').toEqual(expectedRunStateText);
   };

   it('can create [A]', fakeAsync(() => {
      canCreate(USER_ADMIN, GAME_A, 'waiting to start');
   }));

   it('can create [B]', fakeAsync(() => {
      canCreate(USER_PLAYER, GAME_B, 'running');
   }));

   it('can create [C]', fakeAsync(() => {
      canCreate(USER_ADMIN, GAME_C, 'stopped');
   }));

});
