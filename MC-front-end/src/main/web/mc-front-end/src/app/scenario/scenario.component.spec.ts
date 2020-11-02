import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { NamedUUID } from '../named-uuid';
import { Scenario } from '../scenario';
import { ScenarioComponent } from './scenario.component';
import { ScenarioService } from '../scenario.service';

import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('ScenarioComponent', () => {
	let component: ScenarioComponent;
	let fixture: ComponentFixture<ScenarioComponent>;

	const IDENTIFIER_A: NamedUUID = { id: '123456', title: 'Section Attack' };
	const IDENTIFIER_B: NamedUUID = { id: '345678', title: 'Beach Assault' };
	const SCENARIO_A: Scenario = { identifier: IDENTIFIER_A, description: 'Basic fire-and-movement tactical training.' };
	const SCENARIO_B: Scenario = { identifier: IDENTIFIER_B, description: 'Fast and deadly.' };

	const setUp = (testScenario: Scenario) => {
		const scenarioServiceStub = jasmine.createSpyObj('ScenarioService', ['getScenario']);
		scenarioServiceStub.getScenario.and.returnValue(of(testScenario));

		TestBed.configureTestingModule({
			declarations: [ScenarioComponent],
			providers: [{
				provide: ActivatedRoute,
				useValue: {
					params: of({ id: testScenario.identifier.id }),
					snapshot: {
						paramMap: convertToParamMap({ id: testScenario.identifier.id })
					}
				}
			},
			{ provide: ScenarioService, useValue: scenarioServiceStub }]
		});

		fixture = TestBed.createComponent(ScenarioComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};
	const canCreate = (testScenario: Scenario) => {
		setUp(testScenario);

		expect(component).toBeTruthy();
		expect(component.scenario).toBe(testScenario);
		const displayText: string = fixture.nativeElement.innerText;
		expect(displayText.includes(testScenario.description)).withContext("displayed text includes description").toBeTrue();
	};
	it('can create [a]', () => {
		canCreate(SCENARIO_A);
	});
	it('can create [b]', () => {
		canCreate(SCENARIO_B);
	});
});
