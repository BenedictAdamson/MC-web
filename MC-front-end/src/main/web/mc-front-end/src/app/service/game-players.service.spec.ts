import { v4 as uuid } from 'uuid';
import { Observable } from 'rxjs';

import { HttpClient, HttpResponse } from '@angular/common/http';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';

import { GamePlayers } from '../game-players'
import { GameIdentifier } from '../game-identifier'
import { GamePlayersService } from './game-players.service';


describe('GamePlayersService', () => {
	let httpTestingController: HttpTestingController;

	const SCENARIO_A: string = uuid();
	const SCENARIO_B: string = uuid();
	const USER_ID_A: string = uuid();
	const USER_ID_B: string = uuid();
	const CREATED_A: string = '1970-01-01T00:00:00.000Z';
	const CREATED_B: string = '2020-12-31T23:59:59.999Z';
	const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_A, created: CREATED_A };
	const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_B, created: CREATED_B };
	const GAME_PLAYERS_A: GamePlayers = { identifier: GAME_IDENTIFIER_A, recruiting: true, users: [USER_ID_A, USER_ID_B] };
	const GAME_PLAYERS_B: GamePlayers = { identifier: GAME_IDENTIFIER_B, recruiting: false, users: [] };

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
		const service: GamePlayersService = TestBed.get(GamePlayersService);
		expect(service).toBeTruthy();
	});

	const testGetGamePlayers = function(gamePlayers: GamePlayers) {
		const service: GamePlayersService = TestBed.get(GamePlayersService);

		service.getGamePlayers(gamePlayers.identifier).subscribe(g => expect(g).toEqual(gamePlayers));

		const request = httpTestingController.expectOne(GamePlayersService.getApiGamePlayersPath(gamePlayers.identifier));
		expect(request.request.method).toEqual('GET');
		request.flush(gamePlayers);
		httpTestingController.verify();
	};

	it('can get game players [A]', () => {
		testGetGamePlayers(GAME_PLAYERS_A);
	})

	it('can get game players [B]', () => {
		testGetGamePlayers(GAME_PLAYERS_B);
	})

	const testJoinGame = function(gamePlayers0: GamePlayers, user: string) {
		const id: GameIdentifier = gamePlayers0.identifier;
		var users: string[] = gamePlayers0.users;
		users.push(user);
		const gamePlayers: GamePlayers = { identifier: id, recruiting: gamePlayers0.recruiting, users: users };
		const service: GamePlayersService = TestBed.get(GamePlayersService);

		const result: Observable<GamePlayers> = service.joinGame(id);

		expect(result).withContext('result').not.toBeNull();// guard
		result.subscribe(gp => {
			expect(gp).withContext('GamePlayers').not.toBeNull();// guard
			expect(gp.identifier).withContext('GamePlayers.identifier').toEqual(id);
			expect(gp.recruiting).withContext('GamePlayers.recruiting').toEqual(gamePlayers0.recruiting);
			expect(gp.users).withContext('GamePlayers.users').toEqual(users);
		});

		const request = httpTestingController.expectOne(GamePlayersService.getApiJoinGamePath(id));
		expect(request.request.method).toEqual('POST');
		request.flush(gamePlayers);
		httpTestingController.verify();
	}

	it('can join game [A]', () => {
		testJoinGame(GAME_PLAYERS_A, USER_ID_A);
	})

	it('can join game [B]', () => {
		testJoinGame(GAME_PLAYERS_B, USER_ID_B);
	})

	const testEndRecuitment = function(gamePlayers0: GamePlayers) {
		const identifier: GameIdentifier = gamePlayers0.identifier;
		const path: string = GamePlayersService.getApiGameEndRecuitmentPath(identifier);
		const service: GamePlayersService = TestBed.get(GamePlayersService);
		const gamePlayersReply: GamePlayers = { identifier: identifier, recruiting: false, users: gamePlayers0.users }

		service.endRecuitment(identifier).subscribe(g => expect(g).toEqual(gamePlayersReply));

		const request = httpTestingController.expectOne(path);
		expect(request.request.method).toEqual('POST');
		request.flush(gamePlayersReply);
		httpTestingController.verify();
	}

	it('can end recuitment [A]', () => {
		testEndRecuitment(GAME_PLAYERS_A);
	})

	it('can end recuitment [B]', () => {
		testEndRecuitment(GAME_PLAYERS_B);
	})



	const testMayJoinGame = function(game: GameIdentifier, mayJoin: boolean) {
		const service: GamePlayersService = TestBed.get(GamePlayersService);

		const result: Observable<boolean> = service.mayJoinGame(game);

		expect(result).withContext('result').not.toBeNull();// guard
		result.subscribe(may => {
			expect(may).withContext('result').toEqual(mayJoin);
		});

		const request = httpTestingController.expectOne(GamePlayersService.getApiMayJoinGamePath(game));
		expect(request.request.method).toEqual('GET');
		request.event(new HttpResponse<boolean>({ body: mayJoin }));
		httpTestingController.verify();
	}

	it('can query whether may join game a [A]', () => {
		testMayJoinGame(GAME_IDENTIFIER_A, true);
	})

	it('can query whether may join game a [B]', () => {
		testMayJoinGame(GAME_IDENTIFIER_B, false);
	})



	const testGetGamePlayersAfterUpdateGamePlayers = function(gamePlayers: GamePlayers) {
		const game: GameIdentifier = gamePlayers.identifier;
		const expectedPath: string = GamePlayersService.getApiGamePlayersPath(game);
		const service: GamePlayersService = TestBed.get(GamePlayersService);

		service.updateGamePlayers(game);
		service.getGamePlayers(game).subscribe(g => expect(g).toEqual(gamePlayers));

		const request = httpTestingController.expectOne(expectedPath);
		expect(request.request.method).toEqual('GET');
		request.flush(gamePlayers);
		httpTestingController.verify();
	};

	it('can get game players after update game players [A]', () => {
		testGetGamePlayersAfterUpdateGamePlayers(GAME_PLAYERS_A);
	})

	it('can get game players after update game players [B]', () => {
		testGetGamePlayersAfterUpdateGamePlayers(GAME_PLAYERS_B);
	})



	const testUpdateGamePlayersAfterGetGamePlayers = function(gamePlayers: GamePlayers) {
		const game: GameIdentifier = gamePlayers.identifier;
		const expectedPath: string = GamePlayersService.getApiGamePlayersPath(game);
		const service: GamePlayersService = TestBed.get(GamePlayersService);

		service.getGamePlayers(game).subscribe(g => expect(g).toEqual(gamePlayers));
		service.updateGamePlayers(game);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].flush(gamePlayers);
		expect(requests[1].request.method).toEqual('GET');
		requests[1].flush(gamePlayers);
		httpTestingController.verify();
	};

	it('can update game players after get game players [A]', () => {
		testUpdateGamePlayersAfterGetGamePlayers(GAME_PLAYERS_A);
	})

	it('can update game players after get game players [B]', () => {
		testUpdateGamePlayersAfterGetGamePlayers(GAME_PLAYERS_B);
	})



	const testGetGamePlayersForChangingValue = function(
		done: any,
		identifier: GameIdentifier,
		recruiting1: boolean,
		users1: string[],
		recruiting2: boolean,
		users2: string[]
	) {
		const gamePlayers1: GamePlayers = { identifier: identifier, recruiting: recruiting1, users: users1 };
		const gamePlayers2: GamePlayers = { identifier: identifier, recruiting: recruiting2, users: users2 };
		const expectedPath: string = GamePlayersService.getApiGamePlayersPath(identifier);
		const service: GamePlayersService = TestBed.get(GamePlayersService);
		var n: number = 0;

		service.getGamePlayers(identifier).subscribe(
			gamePlayers => {
				expect(0 != n || gamePlayers1 == gamePlayers).withContext('provides the first value').toBeTrue();
				expect(1 != n || gamePlayers2 == gamePlayers).withContext('provides the second value').toBeTrue();
				n++;
				if (n == 2) done();
			}
		);
		service.updateGamePlayers(identifier);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].flush(gamePlayers1);
		expect(requests[1].request.method).toEqual('GET');
		requests[1].flush(gamePlayers2);
		httpTestingController.verify();
	};

	it('provides updated game players [A]', (done) => {
		testGetGamePlayersForChangingValue(done, GAME_IDENTIFIER_A, true, [], false, [USER_ID_A]);
	})

	it('provides updated game players [B]', (done) => {
		testGetGamePlayersForChangingValue(done, GAME_IDENTIFIER_B, true, [USER_ID_A], true, [USER_ID_B]);
	})



	const testGetGamePlayersForUnchangedUpdate = function(gamePlayers: GamePlayers) {
		const game: GameIdentifier = gamePlayers.identifier;
		const expectedPath: string = GamePlayersService.getApiGamePlayersPath(game);
		const service: GamePlayersService = TestBed.get(GamePlayersService);
		var n: number = 0;

		service.getGamePlayers(game).subscribe(
			gps => {
				expect(gamePlayers == gps).withContext('provides the expected value').toBeTrue();
				n++;
				expect(n).withContext('number emitted').toEqual(1);
			}
		);
		service.updateGamePlayers(game);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].flush(gamePlayers);
		expect(requests[1].request.method).toEqual('GET');
		requests[1].flush(gamePlayers);
		httpTestingController.verify();
	};

	it('provides distinct game players [A]', () => {
		testGetGamePlayersForUnchangedUpdate(GAME_PLAYERS_A);
	})

	it('provides distinct game players [B]', () => {
		testGetGamePlayersForUnchangedUpdate(GAME_PLAYERS_B);
	})
});
