import { HttpClient } from '@angular/common/http';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ScenarioService } from './scenario.service';
import { Scenario } from './scenario';
import { ScenarioIdentifier } from './scenario-identifier';


describe('ScenarioService', () => {
	let httpTestingController: HttpTestingController;

	const IDENTIFIER_A: ScenarioIdentifier = { id: '123456', title: 'Section Attack'};
	const IDENTIFIER_B: ScenarioIdentifier = { id: '345678', title: 'Beach Assault'};
	const SCENARIO_A: Scenario = { identifier: IDENTIFIER_A, description: 'Basic fire-and-movement tactical training.' };
	const SCENARIO_B: Scenario = { identifier: IDENTIFIER_B, description: 'Fast and deadly.' };

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule]
		});

        /* Inject for each test:
         * HTTP requests will be handled by the mock back-end.
          */
		TestBed.get(HttpClient);
		httpTestingController = TestBed.get(HttpTestingController);
	});

	it('should be created', () => {
		const service: ScenarioService = TestBed.get(ScenarioService);
		expect(service).toBeTruthy();
	});

	it('can get scenario identifiers', () => {
		const scenarios: Scenario[] = [SCENARIO_A, SCENARIO_B];
		const identifiers: ScenarioIdentifier[] = scenarios.map(s => s.identifier);
		const service: ScenarioService = TestBed.get(ScenarioService);

		service.getScenarioIdentifiers().subscribe(ids => expect(ids).toEqual(identifiers));

		const request = httpTestingController.expectOne('/api/scenario');
		expect(request.request.method).toEqual('GET');
		request.flush(identifiers);
		httpTestingController.verify();
	});

	let canGetScenario: CallableFunction;
	canGetScenario = (testScenario: Scenario) => {
		const id = testScenario.identifier.id;
		const service: ScenarioService = TestBed.get(ScenarioService);

		service.getScenario(id).subscribe(scenario => expect(scenario).toEqual(testScenario));

		const request = httpTestingController.expectOne(`/api/scenario/${id}`);
		expect(request.request.method).toEqual('GET');
		request.flush(testScenario);
		httpTestingController.verify();
	};
	it('can get [A]', () => {
		canGetScenario(SCENARIO_A);
	});
	it('can get [B]', () => {
		canGetScenario(SCENARIO_B);
	});
});
