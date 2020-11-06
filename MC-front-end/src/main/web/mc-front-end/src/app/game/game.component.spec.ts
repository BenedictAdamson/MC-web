import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Game } from '../game'
import { GameIdentifier } from '../game-identifier'
import { GameService } from '../game.service';
import { Scenario } from '../scenario';
import { ScenarioService } from '../scenario.service';

import { GameComponent } from './game.component';


describe('GameComponent', () => {
	let component: GameComponent;
	let fixture: ComponentFixture<GameComponent>;

	const SCENARIO_ID_A: uuid = uuid();
	const SCENARIO_ID_B: uuid = uuid();
	const SCENARIO_A: Scenario = { identifier: SCENARIO_ID_A, title: 'Section Attack', description: 'Basic fire-and-movement tactical training.' };
	const SCENARIO_B: Scenario = { identifier: SCENARIO_ID_B, title: 'Beach Assault', description: 'Fast and deadly.' };
	const CREATED_A: string = '1970-01-01T00:00:00.000Z';
	const CREATED_B: string = '2020-12-31T23:59:59.999Z';
	const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_ID_A, created: CREATED_A };
	const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_ID_B, created: CREATED_B };
	const GAME_A: Game = { identifier: GAME_IDENTIFIER_A };
	const GAME_B: Game = { identifier: GAME_IDENTIFIER_B };



	const setUp = function(scenario: Scenario, game: Game) {
		const scenarioServiceStub = jasmine.createSpyObj('ScenarioService', ['getScenario']);
		scenarioServiceStub.getScenario.and.returnValue(of(scenario));

		const gameServiceStub = jasmine.createSpyObj('GameService', ['getGame']);
		gameServiceStub.getGame.and.returnValue(of(game));

		TestBed.configureTestingModule({
			declarations: [GameComponent],
			providers: [{
				provide: ActivatedRoute,
				useValue: {
					params: of({ scenario: game.identifier.scenario, created: game.identifier.created }),
					snapshot: {
						paramMap: convertToParamMap({ scenario: game.identifier.scenario, created: game.identifier.created })
					}
				}
			},
			{ provide: GameService, useValue: gameServiceStub },
			{ provide: ScenarioService, useValue: scenarioServiceStub }]
		});

		fixture = TestBed.createComponent(GameComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};


	const canCreate = function(scenario: Scenario, game: Game) {
		setUp(scenario, game);

		expect(component).toBeTruthy();
		expect(component.scenario).withContext('scenario').toBe(scenario);
		expect(component.game).withContext('game').toBe(game);

		const html: HTMLElement = fixture.nativeElement;
		const displayText: string = html.innerText;
		expect(displayText.includes(scenario.title)).withContext("The game page includes the scenario title").toBeTrue();
		expect(displayText.includes(scenario.description)).withContext("The game page includes the scenario description").toBeTrue();
		expect(displayText.includes(game.identifier.created)).withContext("The game page includes the date and time that the game was set up").toBeTrue();
	};

	it('can create [A]', () => {
		canCreate(SCENARIO_A, GAME_A);
	});

	it('can create [B]', () => {
		canCreate(SCENARIO_B, GAME_B);
	});
});
