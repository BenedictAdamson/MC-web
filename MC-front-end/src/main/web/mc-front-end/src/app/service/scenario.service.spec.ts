import { HttpClient } from '@angular/common/http';
import { v4 as uuid } from 'uuid';


import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { NamedUUID } from './named-uuid';
import { ScenarioService } from './scenario.service';
import { Scenario } from './scenario';


describe('ScenarioService', () => {
	let httpTestingController: HttpTestingController;

	const IDENTIFIER_A: uuid = uuid();
	const IDENTIFIER_B: uuid = uuid();
	const SCENARIO_A: Scenario = { identifier: IDENTIFIER_A, title: 'Section Attack', description: 'Basic fire-and-movement tactical training.' };
	const SCENARIO_B: Scenario = { identifier: IDENTIFIER_B, title: 'Beach Assault', description: 'Fast and deadly.' };

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
		const identifiers: NamedUUID[] = scenarios.map(s => s.identifier);
		const service: ScenarioService = TestBed.get(ScenarioService);

		service.getScenarioIdentifiers().subscribe(ids => expect(ids).toEqual(identifiers));

		const request = httpTestingController.expectOne('/api/scenario');
		expect(request.request.method).toEqual('GET');
		request.flush(identifiers);
		httpTestingController.verify();
	});

	let canGetScenario: CallableFunction;
	canGetScenario = (testScenario: Scenario) => {
		const id: uuid = testScenario.identifier;
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
