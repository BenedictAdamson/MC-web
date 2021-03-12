import { v4 as uuid } from 'uuid';

import { HttpClient } from '@angular/common/http';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';

import { AbstractGamePlayersBackEndService } from './abstract.game-players.back-end.service';
import { HttpGamePlayersBackEndService } from './http.game-players.back-end.service';
import { GamePlayers } from '../game-players';
import { GameIdentifier } from '../game-identifier';
import { GamePlayersService } from './game-players.service';


describe('GamePlayersService', () => {
	let httpTestingController: HttpTestingController;

	const SCENARIO_A: string = uuid();
	const SCENARIO_B: string = uuid();
	const USER_ID_A: string = uuid();
	const USER_ID_B: string = uuid();
	const CHARACTER_ID_A: string = uuid();
	const CHARACTER_ID_B: string = uuid();
	const CREATED_A = '1970-01-01T00:00:00.000Z';
	const CREATED_B = '2020-12-31T23:59:59.999Z';
	const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_A, created: CREATED_A };
	const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_B, created: CREATED_B };
	const USERS_A: Map<string,string> = new Map([
		[CHARACTER_ID_A, USER_ID_A],
		[CHARACTER_ID_B, USER_ID_B]
	]);
	const USERS_B: Map<string,string> = new Map([]);
	const GAME_PLAYERS_A: GamePlayers = new GamePlayers(GAME_IDENTIFIER_A, true, USERS_A);
	const GAME_PLAYERS_B: GamePlayers = new GamePlayers(GAME_IDENTIFIER_B, false, USERS_B);

	const setUp = (): GamePlayersService => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule]
		});

		const httpClient: HttpClient = TestBed.inject(HttpClient);
		httpTestingController = TestBed.inject(HttpTestingController);
		const backEnd: AbstractGamePlayersBackEndService = new HttpGamePlayersBackEndService(httpClient);
		return new GamePlayersService(backEnd);
	};

	it('should be created', () => {
		const service: GamePlayersService = setUp();
		expect(service).toBeTruthy();
	});

	const testGet = (gamePlayers: GamePlayers) => {
		const expectedPath: string = HttpGamePlayersBackEndService.getApiGamePlayersPath(gamePlayers.game);
		const service: GamePlayersService = setUp();

		service.get(gamePlayers.game).subscribe(g => expect(g).toEqual(gamePlayers));

		const request = httpTestingController.expectOne(expectedPath);
		expect(request.request.method).toEqual('GET');
		request.flush(gamePlayers);
		httpTestingController.verify();
	};

	it('can get game players [A]', () => {
		testGet(GAME_PLAYERS_A);
	});

	it('can get game players [B]', () => {
		testGet(GAME_PLAYERS_B);
	});


	const testJoinGame = (done: any, gamePlayers0: GamePlayers, user: string) => {
		const game: GameIdentifier = gamePlayers0.game;
		const expectedPath: string = HttpGamePlayersBackEndService.getApiJoinGamePath(game);
		const users: Map<string,string> = gamePlayers0.users;
		users.set(CHARACTER_ID_A, user);
		// Tough test: the reply identifier is not the same object
		const gamePlayers1: GamePlayers = new GamePlayers(
			{ scenario: game.scenario, created: game.created },
			gamePlayers0.recruiting,
			users
		);
		const service: GamePlayersService = setUp();

		service.joinGame(game);

		const request = httpTestingController.expectOne(expectedPath);
		expect(request.request.method).toEqual('POST');
		request.flush(gamePlayers1);
		httpTestingController.verify();

		service.get(game).subscribe({
			next: (gps) => {
				expect(gps).withContext('gamePlayers').not.toBeNull();
				expect(gps).withContext('gamePlayers').toEqual(gamePlayers1);
				done();
			}, error: (e) => { fail(e); }, complete: () => { }
		});
	};

	it('can join game [A]', (done) => {
		testJoinGame(done, GAME_PLAYERS_A, USER_ID_A);
	});

	it('can join game [B]', (done) => {
		testJoinGame(done, GAME_PLAYERS_B, USER_ID_B);
	});


	const testEndRecuitment = (done: any, gamePlayers0: GamePlayers) => {
		const game: GameIdentifier = gamePlayers0.game;
		const path: string = HttpGamePlayersBackEndService.getApiGameEndRecuitmentPath(game);
		const service: GamePlayersService = setUp();
		// Tough test: the reply identifier is not the same object
		const gamePlayersReply: GamePlayers = new GamePlayers(
			{ scenario: game.scenario, created: game.created },
			false,
			gamePlayers0.users
		);

		service.endRecruitment(game);

		const request = httpTestingController.expectOne(path);
		expect(request.request.method).toEqual('POST');
		request.flush(gamePlayersReply);
		httpTestingController.verify();

		service.get(game).subscribe({
			next: (gps) => {
				expect(gps).withContext('gamePlayers').not.toBeNull();
				expect(gps).withContext('gamePlayers').toEqual(gamePlayersReply);
				done();
			}, error: (e) => { fail(e); }, complete: () => { }
		});
	};

	it('can end recuitment [A]', (done) => {
		testEndRecuitment(done, GAME_PLAYERS_A);
	});

	it('can end recuitment [B]', (done) => {
		testEndRecuitment(done, GAME_PLAYERS_B);
	});



	const testGetAfterUpdate = (gamePlayers: GamePlayers) => {
		// Tough test: use two identifiers that are semantically equivalent, but not the same object.
		const game1: GameIdentifier = gamePlayers.game;
		const game2: GameIdentifier = { scenario: game1.scenario, created: game1.created };
		const expectedPath: string = HttpGamePlayersBackEndService.getApiGamePlayersPath(game1);
		const service: GamePlayersService = setUp();

		service.update(game1);
		service.get(game2).subscribe(g => expect(g).toEqual(gamePlayers));

		// Only one GET expected because should use the cached value.
		const request = httpTestingController.expectOne(expectedPath);
		expect(request.request.method).toEqual('GET');
		request.flush(gamePlayers);
		httpTestingController.verify();
	};

	it('can get game players after update game players [A]', () => {
		testGetAfterUpdate(GAME_PLAYERS_A);
	});

	it('can get game players after update game players [B]', () => {
		testGetAfterUpdate(GAME_PLAYERS_B);
	});



	const testUpdateAfterGet = (gamePlayers: GamePlayers) => {
		const game: GameIdentifier = gamePlayers.game;
		const expectedPath: string = HttpGamePlayersBackEndService.getApiGamePlayersPath(game);
		const service: GamePlayersService = setUp();

		service.get(game).subscribe(g => expect(g).toEqual(gamePlayers));
		service.update(game);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].flush(gamePlayers);
		expect(requests[1].request.method).toEqual('GET');
		requests[1].flush(gamePlayers);
		httpTestingController.verify();
	};

	it('can update game players after get game players [A]', () => {
		testUpdateAfterGet(GAME_PLAYERS_A);
	});

	it('can update game players after get game players [B]', () => {
		testUpdateAfterGet(GAME_PLAYERS_B);
	});



	const testGetForChangingValue = (
		done: any,
		game: GameIdentifier,
		recruiting1: boolean,
		users1: Map<string,string>,
		recruiting2: boolean,
		users2: Map<string,string>
	) => {
		const gamePlayers1: GamePlayers = new GamePlayers(game, recruiting1, users1);
		const gamePlayers2: GamePlayers = new GamePlayers(game, recruiting2, users2);
		const expectedPath: string = HttpGamePlayersBackEndService.getApiGamePlayersPath(game);
		const service: GamePlayersService = setUp();
		let n = 0;

		service.get(game).subscribe(
			gamePlayers => {
				expect(0 !== n || gamePlayers1 === gamePlayers).withContext('provides the first value').toBeTrue();
				expect(1 !== n || gamePlayers2 === gamePlayers).withContext('provides the second value').toBeTrue();
				n++;
				if (n === 2) {
					done();
					}
			}
		);
		service.update(game);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].flush(gamePlayers1);
		expect(requests[1].request.method).toEqual('GET');
		requests[1].flush(gamePlayers2);
		httpTestingController.verify();
	};

	it('provides updated game players [A]', (done) => {
		testGetForChangingValue(done, GAME_IDENTIFIER_A, true, new Map([]), false, new Map([[CHARACTER_ID_A, USER_ID_A]]));
	});

	it('provides updated game players [B]', (done) => {
		testGetForChangingValue(
			done, GAME_IDENTIFIER_B, true,
			new Map([[CHARACTER_ID_A, USER_ID_A]]), true,
			new Map([[CHARACTER_ID_B, USER_ID_B]])
			);
	});



	const testGetForUnchangedUpdate = (gamePlayers: GamePlayers) => {
		const game: GameIdentifier = gamePlayers.game;
		const expectedPath: string = HttpGamePlayersBackEndService.getApiGamePlayersPath(game);
		const service: GamePlayersService = setUp();
		let n = 0;

		service.get(game).subscribe(
			gps => {
				expect(gamePlayers === gps).withContext('provides the expected value').toBeTrue();
				n++;
				expect(n).withContext('number emitted').toEqual(1);
			}
		);
		service.update(game);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].flush(gamePlayers);
		expect(requests[1].request.method).toEqual('GET');
		requests[1].flush(gamePlayers);
		httpTestingController.verify();
	};

	it('provides distinct game players [A]', () => {
		testGetForUnchangedUpdate(GAME_PLAYERS_A);
	});

	it('provides distinct game players [B]', () => {
		testGetForUnchangedUpdate(GAME_PLAYERS_B);
	});
});
