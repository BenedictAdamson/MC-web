import { Observable, of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';

import { Game } from '../game';
import { GameIdentifier } from '../game-identifier';
import { GameService } from '../service/game.service';
import { GameComponent } from '../game/game.component';
import { GamesComponent } from './games.component';
import { MockSelfService } from '../service/mock/mock.self.service';
import { SelfService } from '../service/self.service';
import { User } from '../user';

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('GamesComponent', () => {
	let routerSpy: any;
	let gameServiceSpy: any
	let component: GamesComponent;
	let fixture: ComponentFixture<GamesComponent>;

	const USER_ADMIN: User = { id: uuid(), username: 'Allan', password: null, authorities: ['ROLE_MANAGE_GAMES'] };
	const USER_NORMAL: User = { id: uuid(), username: 'Benedict', password: null, authorities: [] };

	const SCENARIO_A: string = uuid();
	const SCENARIO_B: string = uuid();
	const CREATED_A: string = '1970-01-01T00:00:00.000Z';
	const CREATED_B: string = '2020-12-31T23:59:59.999Z';
	const GAMES_0: string[] = [];
	const GAMES_2: string[] = [CREATED_A, CREATED_B];
	const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_A, created: CREATED_A };
	const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_B, created: CREATED_B };
	const GAME_A: Game = { identifier: GAME_IDENTIFIER_A };
	const GAME_B: Game = { identifier: GAME_IDENTIFIER_B };

	const getScenario = function(component: GamesComponent): string | null {
		var scenario: string | null = null;
		component.scenario$.subscribe({
			next: (s) => scenario = s,
			error: (err) => fail(err),
			complete: () => { }
		});
		return scenario;
	};

	const getGames = function(component: GamesComponent): string[] | null {
		var games: string[] | null = null;
		component.games$.subscribe({
			next: (g) => games = g,
			error: (err) => fail(err),
			complete: () => { }
		});
		return games;
	};

	const setUpForNgInit = function(self: User, scenario: string, gamesOfScenario: string[]) {
		gameServiceSpy = jasmine.createSpyObj('GameService', ['getGamesOfScenario', 'updateGamesOfScenario']);
		gameServiceSpy.getGamesOfScenario.and.returnValue(of(gamesOfScenario));
		gameServiceSpy.updateGamesOfScenario.and.returnValue(null);

		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			declarations: [GamesComponent],
			providers: [{
				provide: ActivatedRoute,
				useValue: {
					parent: {
						paramMap: of(convertToParamMap({ scenario: scenario })),
					},
					snapshot: {
						parent: {
							paramMap: convertToParamMap({ scenario: scenario })
						}
					}
				}
			},
			{ provide: GameService, useValue: gameServiceSpy },
			{ provide: SelfService, useFactory: () => { return new MockSelfService(self, true); } }]
		});

		fixture = TestBed.createComponent(GamesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};


	const assertInvariants = function() {
		expect(component).toBeTruthy();

		expect(component.scenario$).withContext('scenario$').toBeTruthy();
		expect(component.games$).withContext('games$').toBeTruthy();

		const html: HTMLElement = fixture.nativeElement;
		const gamesList: HTMLUListElement | null = html.querySelector('#games');
		const createGameButton: HTMLButtonElement | null = html.querySelector('button#create-game');

		const createGameButtonText: string = createGameButton ? createGameButton.innerText : "";

		expect(createGameButton).withContext('#create-game button').not.toBeNull();
		expect(createGameButtonText).withContext('#create-game button text').toEqual('Create game');

		expect(gamesList).withContext('games list').not.toBeNull();
		if (gamesList) {
			const gameEntries: NodeListOf<HTMLLIElement> = gamesList.querySelectorAll('li');
			for (let i = 0; i < gameEntries.length; i++) {
				const entry: HTMLLIElement = gameEntries.item(i);
				const link: HTMLAnchorElement | null = entry.querySelector('a');
				expect(link).withContext('entry has link').not.toBeNull();
			}
		}
	};


	const testNgInit = function(self: User, scenario: string, gamesOfScenario: string[]) {
		setUpForNgInit(self, scenario, gamesOfScenario);

		assertInvariants();
		expect(getScenario(component)).withContext('scenario$').toEqual(scenario);
		expect(getGames(component)).withContext('games$').toEqual(gamesOfScenario);
		expect(gameServiceSpy.updateGamesOfScenario.calls.count()).withContext('gameService.updateGamesOfScenario calls').toEqual(1);
		expect(gameServiceSpy.updateGamesOfScenario.calls.argsFor(0)).withContext('gameService.updateGamesOfScenario args').toEqual([scenario]);

		const html: HTMLElement = fixture.nativeElement;
		const gamesList: HTMLUListElement | null = html.querySelector('#games');

		if (gamesList) {
			const gameEntries: NodeListOf<HTMLLIElement> = gamesList.querySelectorAll('li');
			expect(gameEntries.length).withContext('number of game entries').toBe(gamesOfScenario.length);
			for (let i = 0; i < gameEntries.length; i++) {
				const expectedGame: string = gamesOfScenario[i];
				const entry: HTMLLIElement = gameEntries.item(i);
				const link: HTMLAnchorElement | null = entry.querySelector('a');
				const linkText: string | null = link ? link.textContent : null;
				expect(linkText).withContext('entry link text contains game title').toContain(expectedGame);
			}
		}
	};
	it('can initialize [a]', () => {
		testNgInit(USER_ADMIN, SCENARIO_A, GAMES_0);
	});
	it('can initialize [b]', () => {
		testNgInit(USER_NORMAL, SCENARIO_B, GAMES_2);
	});



	const setUpForCreateGame = function(game: Game) {
		const scenario: string = game.identifier.scenario;
		gameServiceSpy = jasmine.createSpyObj('GameService', ['getGamesOfScenario', 'createGame', 'updateGamesOfScenario']);
		gameServiceSpy.getGamesOfScenario.and.returnValue(of([]));
		gameServiceSpy.createGame.and.returnValue(of(game));
		gameServiceSpy.updateGamesOfScenario.and.returnValue(null);

		routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
		routerSpy.navigateByUrl.and.returnValue(null);

		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			declarations: [GamesComponent],
			providers: [{
				provide: ActivatedRoute,
				useValue: {
					parent: {
						paramMap: of(convertToParamMap({ scenario: scenario })),
					},
					snapshot: {
						parent: {
							paramMap: convertToParamMap({ scenario: scenario })
						}
					}
				}
			},
			{ provide: GameService, useValue: gameServiceSpy },
			{ provide: Router, useValue: routerSpy },
			{ provide: SelfService, useFactory: () => { return new MockSelfService(USER_ADMIN, true); } }]
		});

		fixture = TestBed.createComponent(GamesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};
	const testCreateGame = function(game: Game) {
		const expectedPath: string = GameComponent.getGamePath(game.identifier);
		setUpForCreateGame(game);

		component.createGame();
		tick();
		tick();
		fixture.detectChanges();

		assertInvariants();
		expect(routerSpy.navigateByUrl.calls.count()).withContext('router.navigateByUrl calls').toEqual(1);
		expect(routerSpy.navigateByUrl.calls.argsFor(0)).withContext('router.navigateByUrl args').toEqual([expectedPath]);
		expect(gameServiceSpy.updateGamesOfScenario.calls.count()).withContext('gameService.updateGamesOfScenario calls').toEqual(2);
		expect(gameServiceSpy.updateGamesOfScenario.calls.argsFor(1)).withContext('gameService.updateGamesOfScenario args').toEqual([game.identifier.scenario]);
	};

	it('can create game [A]', fakeAsync(() => {
		testCreateGame(GAME_A);
	}));

	it('can create game [B]', fakeAsync(() => {
		testCreateGame(GAME_B);
	}));

	it('disables create game button for normal users', () => {
		setUpForNgInit(USER_NORMAL, SCENARIO_A, []);

		assertInvariants();
		const html: HTMLElement = fixture.nativeElement;
		const createGameButton: HTMLButtonElement | null = html.querySelector('button#create-game');
		if (createGameButton) {
			expect(createGameButton.disabled).withContext('create game button is disabled').toBeTrue();
		}
	});

	it('enables create game button for an administrator', () => {
		setUpForNgInit(USER_ADMIN, SCENARIO_A, []);

		assertInvariants();
		const html: HTMLElement = fixture.nativeElement;
		const createGameButton: HTMLButtonElement | null = html.querySelector('button#create-game');
		if (createGameButton) {
			expect(createGameButton.disabled).withContext('create game button is disabled').toBeFalse();
		}
	});
});
