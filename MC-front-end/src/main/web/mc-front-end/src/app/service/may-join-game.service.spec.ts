import { v4 as uuid } from 'uuid';
import { Observable } from 'rxjs';

import { HttpClient, HttpResponse } from '@angular/common/http';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';

import { GamePlayers } from '../game-players'
import { GameIdentifier } from '../game-identifier'
import { MayJoinGameService } from './may-join-game.service';


describe('MayJoinGameService', () => {
	let httpTestingController: HttpTestingController;

	const SCENARIO_A: string = uuid();
	const SCENARIO_B: string = uuid();
	const USER_ID_A: string = uuid();
	const USER_ID_B: string = uuid();
	const CREATED_A: string = '1970-01-01T00:00:00.000Z';
	const CREATED_B: string = '2020-12-31T23:59:59.999Z';
	const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_A, created: CREATED_A };
	const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_B, created: CREATED_B };
	const GAME_PLAYERS_A: GamePlayers = { game: GAME_IDENTIFIER_A, recruiting: true, users: [USER_ID_A, USER_ID_B] };
	const GAME_PLAYERS_B: GamePlayers = { game: GAME_IDENTIFIER_B, recruiting: false, users: [] };

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
		const service: MayJoinGameService = TestBed.get(MayJoinGameService);
		expect(service).toBeTruthy();
	});


	const testMayJoinGame = function(game: GameIdentifier, mayJoin: boolean) {
		const service: MayJoinGameService = TestBed.get(MayJoinGameService);

		const result: Observable<boolean> = service.mayJoinGame(game);

		expect(result).withContext('result').not.toBeNull();// guard
		result.subscribe(may => {
			expect(may).withContext('result').toEqual(mayJoin);
		});

		const request = httpTestingController.expectOne(MayJoinGameService.getApiMayJoinGamePath(game));
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



	const testMayJoinGameAfterUpdateMayJoinGame = function(game: GameIdentifier, mayJoin: boolean) {
		// Tough test: use two identifiers that are semantically equivalent, but not the same object.
		const game2: GameIdentifier = { scenario: game.scenario, created: game.created };
		const expectedPath: string = MayJoinGameService.getApiMayJoinGamePath(game);
		const service: MayJoinGameService = TestBed.get(MayJoinGameService);

		service.updateMayJoinGame(game);
		service.mayJoinGame(game2).subscribe(may => expect(may).toEqual(mayJoin));

		// Only one GET expected because should use the cached value.
		const request = httpTestingController.expectOne(expectedPath);
		expect(request.request.method).toEqual('GET');
		request.event(new HttpResponse<boolean>({ body: mayJoin }));
		httpTestingController.verify();
	};

	it('can query whether may join game after update whether may join game [A]', () => {
		testMayJoinGameAfterUpdateMayJoinGame(GAME_IDENTIFIER_A, true);
	})

	it('can query whether may join game after update whether may join game [B]', () => {
		testMayJoinGameAfterUpdateMayJoinGame(GAME_IDENTIFIER_A, false);
	})

	it('can query whether may join game after update whether may join game [C]', () => {
		testMayJoinGameAfterUpdateMayJoinGame(GAME_IDENTIFIER_B, true);
	})

	it('can query whether may join game after update whether may join game [D]', () => {
		testMayJoinGameAfterUpdateMayJoinGame(GAME_IDENTIFIER_B, false);
	})



	const testUpdateMayJoinGameAfterMayJoinGame = function(game: GameIdentifier, mayJoin: boolean) {
		const expectedPath: string = MayJoinGameService.getApiMayJoinGamePath(game);
		const service: MayJoinGameService = TestBed.get(MayJoinGameService);

		service.mayJoinGame(game).subscribe(may => expect(may).toEqual(mayJoin));
		service.updateMayJoinGame(game);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].event(new HttpResponse<boolean>({ body: mayJoin }));
		expect(requests[1].request.method).toEqual('GET');
		requests[1].event(new HttpResponse<boolean>({ body: mayJoin }));
		httpTestingController.verify();
	};

	it('can update whether may join game after query whether may join game [A]', () => {
		testUpdateMayJoinGameAfterMayJoinGame(GAME_IDENTIFIER_A, false);
	})

	it('can update whether may join game after query whether may join game [B]', () => {
		testUpdateMayJoinGameAfterMayJoinGame(GAME_IDENTIFIER_A, true);
	})

	it('can update whether may join game afte rquery whether may join game [C]', () => {
		testUpdateMayJoinGameAfterMayJoinGame(GAME_IDENTIFIER_B, false);
	})

	it('can update whether may join game after query whether may join game [D]', () => {
		testUpdateMayJoinGameAfterMayJoinGame(GAME_IDENTIFIER_B, true);
	})



	const testMayJoinGameForChangingValue = function(
		done: any,
		game: GameIdentifier,
		may1: boolean
	) {
		const may2: boolean = !may1;
		const expectedPath: string = MayJoinGameService.getApiMayJoinGamePath(game);
		const service: MayJoinGameService = TestBed.get(MayJoinGameService);
		var n: number = 0;

		service.mayJoinGame(game).subscribe(
			() => {
				n++;
				if (n == 2) done();
			}
		);
		service.updateMayJoinGame(game);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].event(new HttpResponse<boolean>({ body: may1 }));
		expect(requests[1].request.method).toEqual('GET');
		requests[1].event(new HttpResponse<boolean>({ body: may2 }));
		httpTestingController.verify();
	};

	it('provides updated may join query results [A]', (done) => {
		testMayJoinGameForChangingValue(done, GAME_IDENTIFIER_A, true);
	})

	it('provides updated may join query results [B]', (done) => {
		testMayJoinGameForChangingValue(done, GAME_IDENTIFIER_B, false);
	})



	const testMayJoinGameForUnchangedUpdate = function(game: GameIdentifier, may: boolean) {
		const expectedPath: string = MayJoinGameService.getApiMayJoinGamePath(game);
		const service: MayJoinGameService = TestBed.get(MayJoinGameService);
		var n: number = 0;

		service.mayJoinGame(game).subscribe(
			() => {
				n++;
				expect(n).withContext('number emitted').toEqual(1);
			}
		);
		service.updateMayJoinGame(game);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].event(new HttpResponse<boolean>({ body: may }));
		expect(requests[1].request.method).toEqual('GET');
		requests[1].event(new HttpResponse<boolean>({ body: may }));
		httpTestingController.verify();
	};

	it('provides distinct may join query results [A]', () => {
		testMayJoinGameForUnchangedUpdate(GAME_IDENTIFIER_A, false);
	})

	it('provides distinct may join query results [B]', () => {
		testMayJoinGameForUnchangedUpdate(GAME_IDENTIFIER_B, true);
	})

});
