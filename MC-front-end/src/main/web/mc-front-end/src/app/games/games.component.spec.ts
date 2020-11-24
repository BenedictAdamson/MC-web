import { Observable, of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';

import { AppRoutingModule } from '../app-routing.module';
import { Game } from '../game';
import { GameIdentifier } from '../game-identifier';
import { GameService } from '../game.service';
import { GamesComponent } from './games.component';
import { SelfService } from '../self.service';
import { User } from '../user';

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

class MockSelfService {

	constructor(private self: User) { };

	get username(): string {
		return this.self.username;
	}


	get authorities$(): Observable<string[]> {
		return of(this.self.authorities);
	}
}

describe('GamesComponent', () => {
	let routerSpy: any;
	let component: GamesComponent;
	let fixture: ComponentFixture<GamesComponent>;

	const USER_ADMIN = { username: 'Allan', password: null, authorities: ['ROLE_MANAGE_GAMES'] };
	const USER_NORMAL = { username: 'Benedict', password: null, authorities: [] };

	const SCENARIO_A: uuid = uuid();
	const SCENARIO_B: uuid = uuid();
	const CREATED_A: string = '1970-01-01T00:00:00.000Z';
	const CREATED_B: string = '2020-12-31T23:59:59.999Z';
	const GAMES_0: string[] = [];
	const GAMES_2: string[] = [CREATED_A, CREATED_B];
	const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_A, created: CREATED_A };
	const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_B, created: CREATED_B };
	const GAME_A: Game = { identifier: GAME_IDENTIFIER_A, recruiting: true };
	const GAME_B: Game = { identifier: GAME_IDENTIFIER_B, recruiting: false };

	const setUpForNgInit = function(self: User, scenario: uuid, gamesOfScenario: string[]) {
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
			{ provide: GameService, useValue: gameServiceStub },
			{ provide: SelfService, useFactory: () => { return new MockSelfService(self); } }]
		});

		fixture = TestBed.createComponent(GamesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};
	
	
	const assertInvariants = function() {
		expect(component).toBeTruthy();

		const html: HTMLElement = fixture.nativeElement;
		const gamesList: HTMLUListElement = html.querySelector('#games');

		expect(gamesList).withContext('games list').not.toBeNull();
		const gameEntries: NodeListOf<HTMLLIElement> = gamesList.querySelectorAll('li');
		for (let i = 0; i < gameEntries.length; i++) {
			const entry: HTMLLIElement = gameEntries.item(i);
			const link: HTMLAnchorElement = entry.querySelector('a');
			expect(link).withContext('entry has link').not.toBeNull();
		}
	};
	
	
	const testNgInit = function(self: User, scenario: uuid, gamesOfScenario: string[]) {
		setUpForNgInit(self, scenario, gamesOfScenario);

        assertInvariants();
		expect(component.scenario).toBe(scenario);
		expect(component.games).toBe(gamesOfScenario);

		const html: HTMLElement = fixture.nativeElement;
		const gamesList: HTMLUListElement = html.querySelector('#games');

		const gameEntries: NodeListOf<HTMLLIElement> = gamesList.querySelectorAll('li');
		expect(gameEntries.length).withContext('number of game entries').toBe(gamesOfScenario.length);
		for (let i = 0; i < gameEntries.length; i++) {
			const expectedGame: string = gamesOfScenario[i];
			const entry: HTMLLIElement = gameEntries.item(i);
			const link: HTMLAnchorElement = entry.querySelector('a');
			expect(link.textContent).withContext('entry link text contains game title').toContain(expectedGame);
		}
	};
	it('can initialize [a]', () => {
		testNgInit(USER_ADMIN, SCENARIO_A, GAMES_0);
	});
	it('can initialize [b]', () => {
		testNgInit(USER_NORMAL, SCENARIO_B, GAMES_2);
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
			{ provide: Router, useValue: routerSpy },
			{ provide: SelfService, useFactory: () => { return new MockSelfService(USER_ADMIN); } }]
		});

		fixture = TestBed.createComponent(GamesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};
	const testCreateGame = function(game: Game) {
		const expectedPath: string = AppRoutingModule.getGamePath(game.identifier);
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

	it('does not provide a create game button for normal users', () => {
		setUpForNgInit(USER_NORMAL, SCENARIO_A, []);

		const html: HTMLElement = fixture.nativeElement;
		const createGameButton: HTMLButtonElement = html.querySelector('button#create-game');
		expect(createGameButton).toBeNull();
	});

	it('provides a create game button for an administrator', () => {
		setUpForNgInit(USER_ADMIN, SCENARIO_A, []);

		const html: HTMLElement = fixture.nativeElement;
		const createGameButton: HTMLButtonElement = html.querySelector('button#create-game');
		expect(createGameButton).withContext('#create-game button').not.toBeNull();
		expect(createGameButton.innerText).withContext('#create-game button text').toEqual('Create game');
	});
});
