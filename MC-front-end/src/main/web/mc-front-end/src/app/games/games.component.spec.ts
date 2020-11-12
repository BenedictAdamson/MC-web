import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';

import { Game } from '../game';
import { GameIdentifier } from '../game-identifier';
import { GameService } from '../game.service';
import { GamesComponent } from './games.component';

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('GamesComponent', () => {
	let routerSpy: any;
	let component: GamesComponent;
	let fixture: ComponentFixture<GamesComponent>;

	const SCENARIO_A: uuid = uuid();
	const SCENARIO_B: uuid = uuid();
	const CREATED_A: string = '1970-01-01T00:00:00.000Z';
	const CREATED_B: string = '2020-12-31T23:59:59.999Z';
	const GAMES_0: string[] = [];
	const GAMES_2: string[] = [CREATED_A, CREATED_B];
	const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_A, created: CREATED_A};
	const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_B, created: CREATED_B};
	const GAME_A: Game = {identifier: GAME_IDENTIFIER_A};
	const GAME_B: Game = {identifier: GAME_IDENTIFIER_B};

	const setUpForNgInit = function(scenario: uuid, gamesOfScenario: string[]) {
		const gameServiceStub = jasmine.createSpyObj('GameService', ['getGamesOfScenario']);
		gameServiceStub.getGamesOfScenario.and.returnValue(of(gamesOfScenario));

		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			declarations: [GamesComponent],
			providers: [{
				provide: ActivatedRoute,
				useValue: {
					params: of({ scenario: scenario }),
					snapshot: {
						parent: {
							paramMap: convertToParamMap({ scenario: scenario })
						}
					}
				}
			},
			{ provide: GameService, useValue: gameServiceStub }]
		});

		fixture = TestBed.createComponent(GamesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};
	const testNgInit = function(scenario: uuid, gamesOfScenario: string[]) {
		setUpForNgInit(scenario, gamesOfScenario);

		expect(component).toBeTruthy();
		expect(component.scenario).toBe(scenario);
		expect(component.games).toBe(gamesOfScenario);

		const html: HTMLElement = fixture.nativeElement;
		const gamesList: HTMLUListElement = html.querySelector('#games');
		const createGame: HTMLElement = html.querySelector('#create-game');

		expect(gamesList).withContext('games list').not.toBeNull();
		const gameEntries: NodeListOf<HTMLLIElement> = gamesList.querySelectorAll('li');
		expect(gameEntries.length).withContext('number of game entries').toBe(gamesOfScenario.length);
		for (let i = 0; i < gameEntries.length; i++) {
			const expectedGame: string = gamesOfScenario[i];
			const entry: HTMLLIElement = gameEntries.item(i);
			const link: HTMLAnchorElement = entry.querySelector('a');
			expect(link).withContext('entry has link').not.toBeNull();
			expect(link.textContent).withContext('entry link text contains game title').toContain(expectedGame);
		}

		expect(createGame).withContext('#create-game element').not.toBeNull();
		expect(createGame.innerText).withContext('#create-game element text').toEqual('Create game');
	};
	it('can initialize [a]', () => {
		testNgInit(SCENARIO_A, GAMES_0);
	});
	it('can initialize [b]', () => {
		testNgInit(SCENARIO_B, GAMES_2);
	});



	const setUpForCreateGame = function(game: Game) {
		const scenario: uuid = game.identifier.scenario;
		const gameServiceSpy = jasmine.createSpyObj('GameService', ['getGamesOfScenario', 'createGame']);
		gameServiceSpy.getGamesOfScenario.and.returnValue(of([]));
		gameServiceSpy.createGame.and.returnValue(of(game));
		routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
		routerSpy.navigateByUrl.and.returnValue(null);

		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			declarations: [GamesComponent],
			providers: [{
				provide: ActivatedRoute,
				useValue: {
					params: of({ scenario: scenario }),
					snapshot: {
						parent: {
							paramMap: convertToParamMap({ scenario: scenario })
						}
					}
				}
			},
			{ provide: GameService, useValue: gameServiceSpy },
			
				{ provide: Router, useValue: routerSpy },]
		});

		fixture = TestBed.createComponent(GamesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};
	const testCreateGame = function(game: Game) {
		const expectedPath: string = GameService.getGamePath(game.identifier);
		setUpForCreateGame(game);

		component.createGame();
		tick();
		tick();
		fixture.detectChanges();

		expect(routerSpy.navigateByUrl.calls.count()).withContext('router.navigateByUrl calls').toEqual(1);
		expect(routerSpy.navigateByUrl.calls.argsFor(0)).withContext('router.navigateByUrl args').toEqual([expectedPath]);
	};

	it('can create game [A]', fakeAsync(() => {
		testCreateGame(GAME_A);
	}));

	it('can create game [B]', fakeAsync(() => {
		testCreateGame(GAME_B);
	}));
});
