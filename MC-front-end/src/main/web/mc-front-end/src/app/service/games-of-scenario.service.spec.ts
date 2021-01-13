import { v4 as uuid } from 'uuid';

import { HttpClient } from '@angular/common/http';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';

import { AbstractGamesOfScenarioBackEndService } from './abstract.games-of-scenarios.back-end.service';
import { HttpGamesOfScenarioBackEndService } from './http.games-of-scenarios.back-end.service';
import { GamesOfScenarioService, getApiGamesPath } from './games-of-scenarios.service';


describe('GamesOfScenarioService', () => {
	let httpTestingController: HttpTestingController;

	const SCENARIO_A: string = uuid();
	const SCENARIO_B: string = uuid();
	const CREATED_A: string = '1970-01-01T00:00:00.000Z';
	const CREATED_B: string = '2020-12-31T23:59:59.999Z';
	const CREATEDS_0: string[] = [];
	const CREATEDS_1: string[] = [CREATED_A];
	const CREATEDS_2: string[] = [CREATED_A, CREATED_B];
	
	
	const setUp = function(): GamesOfScenarioService {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule]
		});

		const httpClient: HttpClient = TestBed.get(HttpClient);
		httpTestingController = TestBed.get(HttpTestingController);
		const backEnd: AbstractGamesOfScenarioBackEndService = new HttpGamesOfScenarioBackEndService(httpClient);
		return new GamesOfScenarioService(backEnd);
	};
	

	it('should be created', () => {
		const service: GamesOfScenarioService = setUp();
		expect(service).toBeTruthy();
	});

	const testGetGamesOfScenario = function(scenario: string, identifiers: string[]) {
		const service: GamesOfScenarioService = setUp();

		service.get(scenario).subscribe(ids => expect(ids).toEqual(identifiers));

		const request = httpTestingController.expectOne(getApiGamesPath(scenario));
		expect(request.request.method).toEqual('GET');
		request.flush(identifiers);
		httpTestingController.verify();
	};

	it('can get game identifiers for scenario [0]', () => {
		testGetGamesOfScenario(SCENARIO_A, CREATEDS_0);
	});

	it('can get game identifiers for scenario  [1]', () => {
		testGetGamesOfScenario(SCENARIO_B, CREATEDS_1);
	});

	it('can get game identifiers for scenario  [2]', () => {
		testGetGamesOfScenario(SCENARIO_A, CREATEDS_2);
	});



	const testGetGamesOfScenarioAfterUpdateGamesOfScenario = function(scenario: string, identifiers: string[]) {
		const service: GamesOfScenarioService = setUp();

		service.update(scenario);
		service.get(scenario).subscribe(ids => expect(ids).toEqual(identifiers));

		// Only one GET expected because should use the cached value.
		const request = httpTestingController.expectOne(getApiGamesPath(scenario));
		expect(request.request.method).toEqual('GET');
		request.flush(identifiers);
		httpTestingController.verify();
	};

	it('can update games of scenario before asking for the games of the scenario[0]', () => {
		testGetGamesOfScenarioAfterUpdateGamesOfScenario(SCENARIO_A, CREATEDS_0);
	});

	it('can update games of scenario before asking for the games of the scenario[1]', () => {
		testGetGamesOfScenarioAfterUpdateGamesOfScenario(SCENARIO_B, CREATEDS_1);
	});



	const testUpdateGamesOfScenarioAfterGetGamesOfScenario = function(scenario: string, identifiers: string[]) {
		const service: GamesOfScenarioService = setUp();
		const expectedPath: string = getApiGamesPath(scenario);

		service.get(scenario).subscribe(ids => expect(ids).toEqual(identifiers));
		service.update(scenario);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].flush(identifiers);
		expect(requests[1].request.method).toEqual('GET');
		requests[1].flush(identifiers);
		httpTestingController.verify();
	};

	it('can update games of scenario after asking for the games of the scenario[0]', () => {
		testUpdateGamesOfScenarioAfterGetGamesOfScenario(SCENARIO_A, CREATEDS_0);
	});

	it('can update games of scenario after asking for the games of the scenario[1]', () => {
		testUpdateGamesOfScenarioAfterGetGamesOfScenario(SCENARIO_B, CREATEDS_1);
	});



	const testGetGamesOfScenarioForChangingValue = function(done: any, scenario: string, identifiers1: string[], identifiers2: string[]) {
		const service: GamesOfScenarioService = setUp();
		const expectedPath: string = getApiGamesPath(scenario);
		var n: number = 0;

		service.get(scenario).subscribe(
			ids => {
				expect(0 != n || identifiers1 == ids).withContext('provides the first identifiers').toBeTrue();
				expect(1 != n || identifiers2 == ids).withContext('provides the second identifiers').toBeTrue();
				n++;
				if (n == 2) done();
			}
		);
		service.update(scenario);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].flush(identifiers1);
		expect(requests[1].request.method).toEqual('GET');
		requests[1].flush(identifiers2);
		httpTestingController.verify();
	};

	it('provides updated games of scenario [A]', (done) => {
		testGetGamesOfScenarioForChangingValue(done, SCENARIO_A, CREATEDS_0, CREATEDS_1);
	});

	it('provides updated games of scenario [B]', (done) => {
		testGetGamesOfScenarioForChangingValue(done, SCENARIO_B, CREATEDS_2, CREATEDS_1);
	});





	const testGetGamesOfScenarioForUnchangedUpdate = function(scenario: string, identifiers: string[]) {
		const service: GamesOfScenarioService = setUp();
		const expectedPath: string = getApiGamesPath(scenario);
		var n: number = 0;

		service.get(scenario).subscribe(
			ids => {
				expect(identifiers == ids).withContext('provides the expected identifiers').toBeTrue();
				n++;
				expect(n).withContext('number emitted').toEqual(1);
			}
		);
		service.update(scenario);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].flush(identifiers);
		expect(requests[1].request.method).toEqual('GET');
		requests[1].flush(identifiers);
		httpTestingController.verify();
	};

	it('provides distinct games of scenario [A]', () => {
		testGetGamesOfScenarioForUnchangedUpdate(SCENARIO_A, CREATEDS_0);
	});

	it('provides distinct games of scenario [B]', () => {
		testGetGamesOfScenarioForUnchangedUpdate(SCENARIO_B, CREATEDS_2);
	});

});
