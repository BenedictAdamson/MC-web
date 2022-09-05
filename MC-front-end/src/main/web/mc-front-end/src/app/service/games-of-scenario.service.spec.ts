import { v4 as uuid } from 'uuid';

import { HttpClient } from '@angular/common/http';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';

import { AbstractGamesOfScenarioBackEndService } from './abstract.games-of-scenario.back-end.service';
import { HttpGamesOfScenarioBackEndService } from './http.games-of-scenario.back-end.service';
import { GamesOfScenarioService, getApiGamesOfScenarioPath } from './games-of-scenario.service';
import {NamedUUID} from "../named-uuid";


describe('GamesOfScenarioService', () => {
	let httpTestingController: HttpTestingController;

	const SCENARIO_A: string = uuid();
	const SCENARIO_B: string = uuid();
  const ID_A1: string = uuid();
  const ID_A2: string = uuid();
  const CREATED_A: string = '2022-09-01T00:00:00Z';
  const CREATED_B: string = '2022-09-02T00:00:00Z';
  const NAMED_ID_A: NamedUUID = {id: ID_A1, title: CREATED_A};
  const NAMED_ID_B: NamedUUID = {id: ID_A2, title: CREATED_B};
	const ID_LIST_0: NamedUUID[] = [];
	const ID_LIST_1: NamedUUID[] = [NAMED_ID_A];
	const ID_LIST_2: NamedUUID[] = [NAMED_ID_A, NAMED_ID_B];


	const setUp = function(): GamesOfScenarioService {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule]
		});

		const httpClient: HttpClient = TestBed.inject(HttpClient);
		httpTestingController = TestBed.inject(HttpTestingController);
		const backEnd: AbstractGamesOfScenarioBackEndService = new HttpGamesOfScenarioBackEndService(httpClient);
		return new GamesOfScenarioService(backEnd);
	};


	it('should be created', () => {
		const service: GamesOfScenarioService = setUp();
		expect(service).toBeTruthy();
	});

	const testGetGamesOfScenario = function(scenario: string, identifiers: NamedUUID[]) {
		const service: GamesOfScenarioService = setUp();

		service.get(scenario).subscribe(ids => expect(ids).toEqual(identifiers));

		const request = httpTestingController.expectOne(getApiGamesOfScenarioPath(scenario));
		expect(request.request.method).toEqual('GET');
		request.flush(identifiers);
		httpTestingController.verify();
	};

	it('can get game identifiers for scenario [0]', () => {
		testGetGamesOfScenario(SCENARIO_A, ID_LIST_0);
	});

	it('can get game identifiers for scenario  [1]', () => {
		testGetGamesOfScenario(SCENARIO_A, ID_LIST_1);
	});

	it('can get game identifiers for scenario  [2]', () => {
		testGetGamesOfScenario(SCENARIO_A, ID_LIST_2);
	});



	const testGetGamesOfScenarioAfterUpdateGamesOfScenario = function(scenario: string, identifiers: NamedUUID[]) {
		const service: GamesOfScenarioService = setUp();

		service.update(scenario);
		service.get(scenario).subscribe(ids => expect(ids).toEqual(identifiers));

		// Only one GET expected because should use the cached value.
		const request = httpTestingController.expectOne(getApiGamesOfScenarioPath(scenario));
		expect(request.request.method).toEqual('GET');
		request.flush(identifiers);
		httpTestingController.verify();
	};

	it('can update games of scenario before asking for the games of the scenario[0]', () => {
		testGetGamesOfScenarioAfterUpdateGamesOfScenario(SCENARIO_A, ID_LIST_0);
	});

	it('can update games of scenario before asking for the games of the scenario[1]', () => {
		testGetGamesOfScenarioAfterUpdateGamesOfScenario(SCENARIO_B, ID_LIST_1);
	});



	const testUpdateGamesOfScenarioAfterGetGamesOfScenario = function(scenario: string, identifiers: NamedUUID[]) {
		const service: GamesOfScenarioService = setUp();
		const expectedPath: string = getApiGamesOfScenarioPath(scenario);

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
		testUpdateGamesOfScenarioAfterGetGamesOfScenario(SCENARIO_A, ID_LIST_0);
	});

	it('can update games of scenario after asking for the games of the scenario[1]', () => {
		testUpdateGamesOfScenarioAfterGetGamesOfScenario(SCENARIO_B, ID_LIST_1);
	});



	const testGetGamesOfScenarioForChangingValue = function(done: any, scenario: string, identifiers1: NamedUUID[], identifiers2: NamedUUID[]) {
		const service: GamesOfScenarioService = setUp();
		const expectedPath: string = getApiGamesOfScenarioPath(scenario);
    let n: number = 0;

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
		testGetGamesOfScenarioForChangingValue(done, SCENARIO_A, ID_LIST_0, ID_LIST_1);
	});

	it('provides updated games of scenario [B]', (done) => {
		testGetGamesOfScenarioForChangingValue(done, SCENARIO_A, ID_LIST_2, ID_LIST_1);
	});





	const testGetGamesOfScenarioForUnchangedUpdate = function(scenario: string, identifiers: NamedUUID[]) {
		const service: GamesOfScenarioService = setUp();
		const expectedPath: string = getApiGamesOfScenarioPath(scenario);
    let n: number = 0;

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
		testGetGamesOfScenarioForUnchangedUpdate(SCENARIO_A, ID_LIST_0);
	});

	it('provides distinct games of scenario [B]', () => {
		testGetGamesOfScenarioForUnchangedUpdate(SCENARIO_A, ID_LIST_2);
	});

});
