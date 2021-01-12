import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { AbstractScenarioBackEndService } from '../service/abstract.scenario.back-end.service';
import { Scenario } from '../scenario';
import { ScenarioComponent } from './scenario.component';
import { ScenarioService } from '../service/scenario.service';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MockScenarioBackEndService } from '../service/mock/mock.scenario.back-end.service';

describe('ScenarioComponent', () => {
	let component: ScenarioComponent;
	let fixture: ComponentFixture<ScenarioComponent>;

	const IDENTIFIER_A: string = uuid();
	const IDENTIFIER_B: string = uuid();
	const SCENARIO_A: Scenario = { identifier: IDENTIFIER_A, title: 'Section Attack', description: 'Basic fire-and-movement tactical training.' };
	const SCENARIO_B: Scenario = { identifier: IDENTIFIER_B, title: 'Beach Assault', description: 'Fast and deadly.' };


	const getScenario = function(component: ScenarioComponent): Scenario | null {
		var scenario: Scenario | null = null;
		component.scenario$.subscribe({
			next: (s) => scenario = s,
			error: (err) => fail(err),
			complete: () => { }
		});
		return scenario;
	};


	const setUpForNgInit = function(testScenario: Scenario,) {
		const scenarioBackEndService: AbstractScenarioBackEndService = new MockScenarioBackEndService([testScenario]);

		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			declarations: [ScenarioComponent],
			providers: [{
				provide: ActivatedRoute,
				useValue: {
					paramMap: of(convertToParamMap({ scenario: testScenario.identifier }))
				}
			},
			{ provide: AbstractScenarioBackEndService, useValue: scenarioBackEndService }]
		});

		fixture = TestBed.createComponent(ScenarioComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};


	const canCreate = (testScenario: Scenario) => {
		setUpForNgInit(testScenario);

		expect(component).toBeTruthy();
		expect(getScenario(component)).toBe(testScenario);

		const html: HTMLElement = fixture.nativeElement;
		const displayText: string = html.innerText;
		const selfLink: HTMLAnchorElement | null = html.querySelector('a#scenario');
		expect(displayText.includes(testScenario.title)).withContext("displayed text includes title").toBeTrue();
		expect(displayText.includes(testScenario.description)).withContext("displayed text includes description").toBeTrue();
		expect(selfLink).withContext("self link").not.toBeNull();
	};

	it('can create [a]', () => {
		canCreate(SCENARIO_A);
	});

	it('can create [b]', () => {
		canCreate(SCENARIO_B);
	});
});
