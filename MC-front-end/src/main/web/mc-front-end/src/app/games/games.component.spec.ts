import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { GameService } from '../game.service';
import { GamesComponent } from './games.component';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('GamesComponent', () => {
	let component: GamesComponent;
	let fixture: ComponentFixture<GamesComponent>;

	const SCENARIO_A: uuid = uuid();
	const SCENARIO_B: uuid = uuid();
	const GAMES_0: string[] = [];
	const GAMES_2: string[] = ['1970-01-01T00:00:00.000Z', '2020-12-31T23:59:59.999Z'];

	const setUp = function(scenario: uuid, gamesOfScenario: string[]) {
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
		setUp(scenario, gamesOfScenario);

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
});
