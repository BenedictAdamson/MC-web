import { v4 as uuid } from 'uuid';
import { Observable } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

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
	const GAME_A: Game = { identifier: GAME_IDENTIFIER_A };
	const GAME_B: Game = { identifier: GAME_IDENTIFIER_B };

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
});
