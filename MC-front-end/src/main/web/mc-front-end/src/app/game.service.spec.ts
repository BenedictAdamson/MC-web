import { HttpClient } from '@angular/common/http';
import { v4 as uuid } from 'uuid';


import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { NamedUUID } from './named-uuid';
import { GameService } from './game.service';


describe('GameService', () => {
	let httpTestingController: HttpTestingController;

	const SCENARIO_A: uuid = uuid();
	const SCENARIO_B: uuid = uuid();
	const IDS_0: string[] = [];
	const IDS_1: string[] = ['1970-01-01T00:00:00.000Z'];
	const IDS_2: string[] = ['1970-01-01T00:00:00.000Z', '2020-12-31T23:59:59.999Z'];

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
		const service: GameService = TestBed.get(GameService);
		expect(service).toBeTruthy();
	});

	let testGetGamesOfScenario = function(scenario:uuid, identifiers: string[]) {
		const service: GameService = TestBed.get(GameService);

		service.getGamesOfScenario(scenario).subscribe(ids => expect(ids).toEqual(identifiers));

		const request = httpTestingController.expectOne(GameService.getGamesPath(scenario));
		expect(request.request.method).toEqual('GET');
		request.flush(identifiers);
		httpTestingController.verify();
	};

	it('can get game identifiers [0]', () => {
		testGetGamesOfScenario(SCENARIO_A, IDS_0);
	});

	it('can get game identifiers [1]', () => {
		testGetGamesOfScenario(SCENARIO_B, IDS_1);
	});

	it('can get game identifiers [2]', () => {
		testGetGamesOfScenario(SCENARIO_A, IDS_2);
	});
});
