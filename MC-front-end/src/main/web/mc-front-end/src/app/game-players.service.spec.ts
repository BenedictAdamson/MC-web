import { v4 as uuid } from 'uuid';
import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { GamePlayers } from './game-players'
import { GameIdentifier } from './game-identifier'
import { GamePlayersService } from './game-players.service';
import { User } from './user'


describe('GamePlayersService', () => {
	let httpTestingController: HttpTestingController;

	const SCENARIO_A: uuid = uuid();
	const SCENARIO_B: uuid = uuid();
	const USER_A: uuid = uuid();
	const USER_B: uuid = uuid();
	const CREATED_A: string = '1970-01-01T00:00:00.000Z';
	const CREATED_B: string = '2020-12-31T23:59:59.999Z';
	const CREATEDS_0: string[] = [];
	const CREATEDS_1: string[] = [CREATED_A];
	const CREATEDS_2: string[] = [CREATED_A, CREATED_B];
	const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_A, created: CREATED_A };
	const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_B, created: CREATED_B };
	const GAME_PLAYERS_A: GamePlayers = { identifier: GAME_IDENTIFIER_A, recruiting: true, users: [USER_A, USER_B] };
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

	const testJoinGame = function(gamePlayers0: GamePlayers, user: User) {
		const id: GameIdentifier = gamePlayers0.identifier;
		var users: uuid[] = gamePlayers0.users;
		users.push(user);
		const gamePlayers: GamePlayers = {identifier: id, recruiting: gamePlayers0.recruiting, users:users};
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
		testJoinGame(GAME_PLAYERS_A, USER_A);
	})

	it('can join game [B]', () => {
		testJoinGame(GAME_PLAYERS_B, USER_B);
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
});
