import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject, defer, of, from } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SelfService } from '../self.service';
import { Scenario } from '../scenario';
import { ScenariosComponent } from './scenarios.component';
import { ScenarioService } from '../scenario.service';


describe('ScenariosComponent', () => {
	let component: ScenariosComponent;
	let fixture: ComponentFixture<ScenariosComponent>;

	const SCENARIO_A: Scenario = { id: '123456', title: 'Section Attack', description: 'Basic fire-and-movement tactical training.' };
	const SCENARIO_B: Scenario = { id: '345678', title: 'Beach Assault', description: 'Fast and deadly.' };

	const setUp = (self: Scenario, testScenarios: Scenario[]) => {
		const scenarioServiceStub = jasmine.createSpyObj('ScenarioService', ['getScenarios']);
		scenarioServiceStub.getScenarios.and.returnValue(of(testScenarios));

		TestBed.configureTestingModule({
			declarations: [ScenariosComponent],
			imports: [RouterTestingModule],
			providers: [
				{ provide: ScenarioService, useValue: scenarioServiceStub }
			]
		});

		fixture = TestBed.createComponent(ScenariosComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};

	const canCreate = (self: Scenario, testScenarios: Scenario[]) => {
		setUp(self, testScenarios);

		expect(component).toBeTruthy();
		expect(component.scenarios).toBe(testScenarios);
		const element: HTMLElement = fixture.nativeElement;
		const heading = element.querySelector('h2');
		expect(heading).withContext('has heading').not.toBeNull();
		expect(heading.textContent).withContext('heading text').toContain('Scenarios');
	};

	it('can create [1]', () => {
		canCreate(SCENARIO_A, [SCENARIO_A]);
	});

	it('can create [2]', () => {
		canCreate(SCENARIO_B, [SCENARIO_A, SCENARIO_B]);
	});
});
