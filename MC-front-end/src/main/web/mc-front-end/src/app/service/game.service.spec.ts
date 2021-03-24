import { v4 as uuid } from 'uuid';
import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AbstractGameBackEndService } from './abstract.game.back-end.service';
import { HttpGameBackEndService } from './http.game.back-end.service';
import { Game } from '../game';
import { GameIdentifier } from '../game-identifier';
import { GameService } from './game.service';


describe('GameService', () => {
	let httpTestingController: HttpTestingController;

	const SCENARIO_A: string = uuid();
	const SCENARIO_B: string = uuid();
	const CREATED_A = '1970-01-01T00:00:00.000Z';
	const CREATED_B = '2020-12-31T23:59:59.999Z';
	const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_A, created: CREATED_A };
	const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_B, created: CREATED_B };
	const GAME_A: Game = { identifier: GAME_IDENTIFIER_A };
	const GAME_B: Game = { identifier: GAME_IDENTIFIER_B };

	const setUp = (): GameService => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule]
		});

		const httpClient: HttpClient = TestBed.inject(HttpClient);
		httpTestingController = TestBed.inject(HttpTestingController);
		const backEnd: AbstractGameBackEndService = new HttpGameBackEndService(httpClient);
		return new GameService(backEnd);
	};

	it('should be created', () => {
		const service: GameService = setUp();
		expect(service).toBeTruthy();
	});


	const testGetGame = (game: Game) => {
		const service: GameService = setUp();

		service.get(game.identifier).subscribe(g => expect(g).toEqual(game));

		const request = httpTestingController.expectOne(GameService.getApiGamePath(game.identifier));
		expect(request.request.method).toEqual('GET');
		request.flush(game);
		httpTestingController.verify();
	};

	it('can get game [A]', () => {
		testGetGame(GAME_A);
	});

	it('can get game [B]', () => {
		testGetGame(GAME_B);
	});

	const testCreateGame = (createdGame: Game) => {
		const scenario: string = createdGame.identifier.scenario;
		const service: GameService = setUp();

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
	};

	it('can create game [A]', () => {
		testCreateGame(GAME_A);
	});

	it('can create game [B]', () => {
		testCreateGame(GAME_B);
	});

});
