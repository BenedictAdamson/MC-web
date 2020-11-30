import { v4 as uuid } from 'uuid';
import { Observable } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';

import { Game } from './game'
import { GameIdentifier } from './game-identifier'
import { GameService } from './game.service';


describe('GameService', () => {
	let httpTestingController: HttpTestingController;

	const SCENARIO_A: uuid = uuid();
	const SCENARIO_B: uuid = uuid();
	const CREATED_A: string = '1970-01-01T00:00:00.000Z';
	const CREATED_B: string = '2020-12-31T23:59:59.999Z';
	const CREATEDS_0: string[] = [];
	const CREATEDS_1: string[] = [CREATED_A];
	const CREATEDS_2: string[] = [CREATED_A, CREATED_B];
	const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_A, created: CREATED_A };
	const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_B, created: CREATED_B };
	const GAME_A: Game = { identifier: GAME_IDENTIFIER_A, recruiting: true };
	const GAME_B: Game = { identifier: GAME_IDENTIFIER_B, recruiting: false };

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

	let testGetGamesOfScenario = function(scenario: uuid, identifiers: string[]) {
		const service: GameService = TestBed.get(GameService);

		service.getGamesOfScenario(scenario).subscribe(ids => expect(ids).toEqual(identifiers));

		const request = httpTestingController.expectOne(GameService.getApiGamesPath(scenario));
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

	const testGetGame = function(game: Game) {
		const service: GameService = TestBed.get(GameService);

		service.getGame(game.identifier).subscribe(g => expect(g).toEqual(game));

		const request = httpTestingController.expectOne(GameService.getApiGamePath(game.identifier));
		expect(request.request.method).toEqual('GET');
		request.flush(game);
		httpTestingController.verify();
	};

	it('can get game [A]', () => {
		testGetGame(GAME_A);
	})

	it('can get game [B]', () => {
		testGetGame(GAME_B);
	})

	const testCreateGame = function(createdGame: Game) {
		const scenario: uuid = createdGame.identifier.scenario;
		const service: GameService = TestBed.get(GameService);

		const result: Observable<Game> = service.createGame(scenario);

		expect(result).withContext('result').not.toBeNull();// guard
		result.subscribe(game => {
			expect(game).withContext('Game').not.toBeNull();// guard
			expect(game.identifier.scenario).withContext('Game.identifier.scenario').toEqual(scenario);
		});

		const request = httpTestingController.expectOne(GameService.getApiGamesPath(scenario));
		expect(request.request.method).toEqual('POST');
		request.flush(createdGame);
		httpTestingController.verify();
	}

	it('can create game [A]', () => {
		testCreateGame(GAME_A);
	})

	it('can create game [B]', () => {
		testCreateGame(GAME_B);
	})

	const testEndRecuitment = function(game: Game, replyRecruiting: boolean) {
		const identifier: GameIdentifier = game.identifier;
		const path: string = GameService.getApiGamePath(identifier);
		const service: GameService = TestBed.get(GameService);
		const gameReply: Game = { identifier: identifier, recruiting: replyRecruiting }

		service.endRecuitment(identifier).subscribe(g => expect(g).toEqual(gameReply));

		const getRequest1 = httpTestingController.expectOne(path);
		expect(getRequest1.request.method).toEqual('GET');
		getRequest1.flush(game);
		const putRequest = httpTestingController.expectOne(path);
		expect(putRequest.request.method).toEqual('PUT');
		putRequest.flush(null);
		const putBody: Game = putRequest.request.body;
		const getRequest2 = httpTestingController.expectOne(path);
		expect(getRequest2.request.method).toEqual('GET');
		getRequest2.flush(gameReply);
		httpTestingController.verify();

		expect(putBody).withContext('body of PUT').not.toBeNull();
		expect(putBody.identifier).withContext('PUT Game.identifier').toEqual(identifier);
		expect(putBody.recruiting).withContext('PUT Game.recruiting').toBeFalse();
	}

	it('can end recuitment [A]', () => {
		testEndRecuitment(GAME_A, false);
	})

	it('can end recuitment [B]', () => {
		testEndRecuitment(GAME_A, true);
	})

	it('can end recuitment [C]', () => {
		testEndRecuitment(GAME_B, false);
	})

	it('can end recuitment [D]', () => {
		testEndRecuitment(GAME_B, true);
	})
});