import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { ScenarioService } from './scenario.service';
import { Scenario } from './scenario';


describe('ScenarioService', () => {
	let httpClient: HttpClient;
	let httpTestingController: HttpTestingController;

	const SCENARIO_A: Scenario = { id: '123456', title: 'Section Attack', description: 'Basic fire-and-movement tactical training.' };
	const SCENARIO_B: Scenario = { id: '345678', title: 'Beach Assault', description: 'Fast and deadly.' };

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule]
		});

        /* Inject for each test:
         * HTTP requests will be handled by the mock back-end.
          */
		httpClient = TestBed.get(HttpClient);
		httpTestingController = TestBed.get(HttpTestingController);
	});

	it('should be created', () => {
		const service: ScenarioService = TestBed.get(ScenarioService);
		expect(service).toBeTruthy();
	});

	it('can get scenarios', () => {
		const testScenarios: Scenario[] = [SCENARIO_A, SCENARIO_B];
		const service: ScenarioService = TestBed.get(ScenarioService);

		service.getScenarios().subscribe(scenarios => expect(scenarios).toEqual(testScenarios));

		const request = httpTestingController.expectOne('/api/scenario');
		expect(request.request.method).toEqual('GET');
		request.flush(testScenarios);
		httpTestingController.verify();
	});

	let canGetScenario: CallableFunction;
	canGetScenario = (testScenario: Scenario) => {
		const id = testScenario.id;
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
