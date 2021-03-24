import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';

import { AbstractGamesOfScenarioBackEndService } from '../service/abstract.games-of-scenario.back-end.service';
import { AbstractSelfService } from '../service/abstract.self.service';
import { Game } from '../game';
import { GameIdentifier } from '../game-identifier';
import { GameService } from '../service/game.service';
import { GamesComponent } from './games.component';
import { MockSelfService } from '../service/mock/mock.self.service';
import { User } from '../user';

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MockGamesOfScenarioBackEndService } from '../service/mock/mock.games-of-scenario.back-end.service';



describe('GamesComponent', () => {
   let routerSpy: any;
   let gameServiceSpy: any;
   let gamesOfScenarioBackEndService: MockGamesOfScenarioBackEndService;
   let selfService: AbstractSelfService;
   let component: GamesComponent;
   let fixture: ComponentFixture<GamesComponent>;

   const USER_MANAGE_GAMES: User = { id: uuid(), username: 'Allan', password: null, authorities: ['ROLE_MANAGE_GAMES'] };
   const USER_PLAYER: User = { id: uuid(), username: 'Benedict', password: null, authorities: ['ROLE_PLAYER'] };
   const USER_NO_ROLES: User = { id: uuid(), username: 'Charlie', password: null, authorities: [] };

   const SCENARIO_A: string = uuid();
   const SCENARIO_B: string = uuid();
   const CREATED_A = '1970-01-01T00:00:00.000Z';
   const CREATED_B = '2020-12-31T23:59:59.999Z';
   const GAMES_0: string[] = [];
   const GAMES_2: string[] = [CREATED_A, CREATED_B];
   const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_A, created: CREATED_A };
   const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_B, created: CREATED_B };
   const GAME_A: Game = { identifier: GAME_IDENTIFIER_A, runState: 'WAITING_TO_START' };
   const GAME_B: Game = { identifier: GAME_IDENTIFIER_B, runState: 'RUNNING' };

   const getScenario = (gc: GamesComponent): string | null => {
      let scenario: string | null = null;
      gc.scenario$.subscribe({
         next: (s) => scenario = s,
         error: (err) => fail(err),
         complete: () => { }
      });
      return scenario;
   };

   const getGames = (gc: GamesComponent): string[] | null => {
      let games: string[] | null = null;
      gc.games$.subscribe({
         next: (g) => games = g,
         error: (err) => fail(err),
         complete: () => { }
      });
      return games;
   };

   const setUpForNgInit = (self: User, scenario: string, gamesOfScenario: string[]) => {
      gameServiceSpy = null;
      gamesOfScenarioBackEndService = new MockGamesOfScenarioBackEndService(scenario, gamesOfScenario);

      TestBed.configureTestingModule({
         imports: [RouterTestingModule],
         declarations: [GamesComponent],
         providers: [{
            provide: ActivatedRoute,
            useValue: {
               parent: {
                  paramMap: of(convertToParamMap({ scenario })),
               },
               snapshot: {
                  parent: {
                     paramMap: convertToParamMap({ scenario })
                  }
               }
            }
         },
         { provide: GameService, useValue: gameServiceSpy },
         { provide: AbstractGamesOfScenarioBackEndService, useValue: gamesOfScenarioBackEndService },
         { provide: AbstractSelfService, useFactory: () => new MockSelfService(self) }]
      });

      fixture = TestBed.createComponent(GamesComponent);
      component = fixture.componentInstance;
      selfService = TestBed.inject(AbstractSelfService);
      selfService.checkForCurrentAuthentication().subscribe();
      fixture.detectChanges();
   };


   const assertInvariants = () => {
      expect(component).toBeTruthy();

      expect(component.scenario$).withContext('scenario$').toBeTruthy();
      expect(component.games$).withContext('games$').toBeTruthy();

      const html: HTMLElement = fixture.nativeElement;
      const gamesList: HTMLUListElement | null = html.querySelector('#games');
      const createGameButton: HTMLButtonElement | null = html.querySelector('button#create-game');

      const createGameButtonText: string = createGameButton ? createGameButton.innerText : '';

      expect(createGameButton).withContext('#create-game button').not.toBeNull();
      expect(createGameButtonText).withContext('#create-game button text').toEqual('Create game');

      expect(gamesList).withContext('games list').not.toBeNull();
   };

   const assertHasGameLinks = (expected: boolean) => {
      const html: HTMLElement = fixture.nativeElement;
      const gamesList: HTMLUListElement | null = html.querySelector('#games');

      expect(gamesList).withContext('games list').not.toBeNull();
      if (gamesList) {
         const gameEntries: NodeListOf<HTMLLIElement> = gamesList.querySelectorAll('li');
         for (let i = 0; i < gameEntries.length; i++) {
            const entry: HTMLLIElement = gameEntries.item(i);
            const link: HTMLAnchorElement | null = entry.querySelector('a');
            expect(link == null).withContext('entry has link').not.toEqual(expected);
         }
      }
   };


   const testNgInit = (self: User, scenario: string, gamesOfScenario: string[]) => {
      const expectHasGameLinks: boolean = self.authorities.includes('ROLE_MANAGE_GAMES') || self.authorities.includes('ROLE_PLAYER');
      setUpForNgInit(self, scenario, gamesOfScenario);

      assertInvariants();
      assertHasGameLinks(expectHasGameLinks);
      expect(getScenario(component)).withContext('scenario$').toEqual(scenario);
      expect(getGames(component)).withContext('games$').toEqual(gamesOfScenario);

      const html: HTMLElement = fixture.nativeElement;
      const gamesList: HTMLUListElement | null = html.querySelector('#games');

      if (gamesList) {
         const gameEntries: NodeListOf<HTMLLIElement> = gamesList.querySelectorAll('li');
         expect(gameEntries.length).withContext('number of game entries').toBe(gamesOfScenario.length);
         for (let i = 0; i < gameEntries.length; i++) {
            const expectedGame: string = gamesOfScenario[i];
            const entry: HTMLLIElement = gameEntries.item(i);
            if (expectHasGameLinks) {
               const link: HTMLAnchorElement | null = entry.querySelector('a');
               const linkText: string | null = link ? link.textContent : null;
               expect(linkText).withContext('entry link text contains game title').toContain(expectedGame);
            }
         }
      }
   };
   it('can initialize [a]', () => {
      testNgInit(USER_MANAGE_GAMES, SCENARIO_A, GAMES_0);
   });
   it('can initialize [b]', () => {
      testNgInit(USER_PLAYER, SCENARIO_B, GAMES_2);
   });
   it('can initialize [c]', () => {
      testNgInit(USER_NO_ROLES, SCENARIO_B, GAMES_2);
   });


   const setUpForCreateGame = (game: Game) => {
      const scenario: string = game.identifier.scenario;
      const userServiceStub = new MockGamesOfScenarioBackEndService(scenario, []);

      gameServiceSpy = jasmine.createSpyObj('GameService', ['createGame']);
      gameServiceSpy.createGame.and.returnValue(of(game));

      routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
      routerSpy.navigateByUrl.and.returnValue(null);

      TestBed.configureTestingModule({
         declarations: [GamesComponent],
         providers: [{
            provide: ActivatedRoute,
            useValue: {
               parent: {
                  paramMap: of(convertToParamMap({ scenario })),
               },
               snapshot: {
                  parent: {
                     paramMap: convertToParamMap({ scenario })
                  }
               }
            }
         },
         { provide: AbstractGamesOfScenarioBackEndService, useValue: userServiceStub },
         { provide: GameService, useValue: gameServiceSpy },
         { provide: Router, useValue: routerSpy },
         { provide: AbstractSelfService, useFactory: () => new MockSelfService(USER_MANAGE_GAMES) }]
      });

      fixture = TestBed.createComponent(GamesComponent);
      component = fixture.componentInstance;
      selfService = TestBed.inject(AbstractSelfService);
      selfService.checkForCurrentAuthentication().subscribe();
      fixture.detectChanges();
   };

   const testCreateGame = (game: Game) => {
      const expectedPath: string = GamesComponent.getGamePagePath(game.identifier);
      setUpForCreateGame(game);

      component.createGame();
      tick();
      tick();
      fixture.detectChanges();

      assertInvariants();
      expect(routerSpy.navigateByUrl.calls.count()).withContext('router.navigateByUrl calls').toEqual(1);
      expect(routerSpy.navigateByUrl.calls.argsFor(0)).withContext('router.navigateByUrl args').toEqual([expectedPath]);
   };

   it('can create game [A]', fakeAsync(() => {
      testCreateGame(GAME_A);
   }));

   it('can create game [B]', fakeAsync(() => {
      testCreateGame(GAME_B);
   }));

   it('disables create game button for normal users', () => {
      setUpForNgInit(USER_NO_ROLES, SCENARIO_A, []);

      assertInvariants();
      const html: HTMLElement = fixture.nativeElement;
      const createGameButton: HTMLButtonElement | null = html.querySelector('button#create-game');
      if (createGameButton) {
         expect(createGameButton.disabled).withContext('create game button is disabled').toBeTrue();
      }
   });

   it('enables create game button for an administrator', () => {
      setUpForNgInit(USER_MANAGE_GAMES, SCENARIO_A, []);

      assertInvariants();
      const html: HTMLElement = fixture.nativeElement;
      const createGameButton: HTMLButtonElement | null = html.querySelector('button#create-game');
      if (createGameButton) {
         expect(createGameButton.disabled).withContext('create game button is disabled').toBeFalse();
      }
   });
});
