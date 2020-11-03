import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { GameService } from '../game.service';
import { Scenario } from '../scenario';
import { ScenarioComponent } from './scenario.component';
import { ScenarioService } from '../scenario.service';

import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('ScenarioComponent', () => {
	let component: ScenarioComponent;
	let fixture: ComponentFixture<ScenarioComponent>;

	const IDENTIFIER_A: uuid = uuid();
	const IDENTIFIER_B: uuid = uuid();
	const SCENARIO_A: Scenario = { identifier: IDENTIFIER_A, title: 'Section Attack', description: 'Basic fire-and-movement tactical training.' };
	const SCENARIO_B: Scenario = { identifier: IDENTIFIER_B, title: 'Beach Assault', description: 'Fast and deadly.' };
	const GAMES_A: string[] = ['1970-01-01T00:00:00.000Z'];
	const GAMES_B: string[] = ['1970-01-01T00:00:00.000Z', '2020-12-31T23:59:59.999Z'];

	const setUp = (testScenario: Scenario, gamesOfScenario: string[]) => {
		const scenarioServiceStub = jasmine.createSpyObj('ScenarioService', ['getScenario']);
		scenarioServiceStub.getScenario.and.returnValue(of(testScenario));

		const gameServiceStub = jasmine.createSpyObj('GameService', ['getGamesOfScenario']);
		gameServiceStub.getGamesOfScenario.and.returnValue(of(gamesOfScenario));

		TestBed.configureTestingModule({
			declarations: [ScenarioComponent],
			providers: [{
				provide: ActivatedRoute,
				useValue: {
					params: of({ id: testScenario.identifier }),
					snapshot: {
						paramMap: convertToParamMap({ id: testScenario.identifier })
					}
				}
			},
			{ provide: GameService, useValue: gameServiceStub },
			{ provide: ScenarioService, useValue: scenarioServiceStub }]
		});

		fixture = TestBed.createComponent(ScenarioComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};
	const canCreate = (testScenario: Scenario, gamesOfScenario: string[]) => {
		setUp(testScenario, gamesOfScenario);

		expect(component).toBeTruthy();
		expect(component.scenario).toBe(testScenario);
		const html: HTMLElement = fixture.nativeElement;
		const displayText: string = html.innerText;
		const gamesList: HTMLUListElement = html.querySelector('#games');
		expect(displayText.includes(testScenario.title)).withContext("displayed text includes title").toBeTrue();
		expect(displayText.includes(testScenario.description)).withContext("displayed text includes description").toBeTrue();
		expect(gamesList).withContext('games list').not.toBeNull();
	};
	it('can create [a]', () => {
		canCreate(SCENARIO_A, GAMES_A);
	});
	it('can create [b]', () => {
		canCreate(SCENARIO_B, GAMES_B);
	});
});
