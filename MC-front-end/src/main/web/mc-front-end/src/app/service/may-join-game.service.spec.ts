import { v4 as uuid } from 'uuid';
import { Observable } from 'rxjs';

import { HttpClient, HttpResponse } from '@angular/common/http';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';

import { AbstractMayJoinGameBackEndService } from './abstract.may-join-game.back-end.service';
import { HttpMayJoinGameBackEndService } from './http.may-join-game.back-end.service';
import { MayJoinGameService } from './may-join-game.service';


describe('MayJoinGameService', () => {
	let httpTestingController: HttpTestingController;

	const GAME_IDENTIFIER_A: string = uuid();
	const GAME_IDENTIFIER_B: string = uuid();


	const setUp = function(): MayJoinGameService {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule]
		});

		const httpClient: HttpClient = TestBed.inject(HttpClient);
		httpTestingController = TestBed.inject(HttpTestingController);
		const backEnd: AbstractMayJoinGameBackEndService = new HttpMayJoinGameBackEndService(httpClient);
		return new MayJoinGameService(backEnd);
	};

	it('should be created', () => {
		const service: MayJoinGameService = setUp();
		expect(service).toBeTruthy();
	});


	const testGet = function(game: string, mayJoin: boolean) {
		const service: MayJoinGameService = setUp();

		const result: Observable<boolean | null> = service.get(game);

		result.subscribe(may => {
			expect(may).withContext('result').toEqual(mayJoin);
		});

		const request = httpTestingController.expectOne(MayJoinGameService.getApiMayJoinGamePath(game));
		expect(request.request.method).toEqual('GET');
		request.event(new HttpResponse<boolean>({ body: mayJoin }));
		httpTestingController.verify();
	}

	it('can query whether may join game a [A]', () => {
		testGet(GAME_IDENTIFIER_A, true);
	})

	it('can query whether may join game a [B]', () => {
		testGet(GAME_IDENTIFIER_B, false);
	})



	const testGetAfterUpdate = function(game: string, mayJoin: boolean) {
		// Tough test: use two identifiers that are semantically equivalent, but not the same object.
		const expectedPath: string = MayJoinGameService.getApiMayJoinGamePath(game);
		const service: MayJoinGameService = setUp();

		service.update(game);
		service.get(game).subscribe(may => expect(may).toEqual(mayJoin));

		// Only one GET expected because should use the cached value.
		const request = httpTestingController.expectOne(expectedPath);
		expect(request.request.method).toEqual('GET');
		request.event(new HttpResponse<boolean>({ body: mayJoin }));
		httpTestingController.verify();
	};

	it('can query whether may join game after update whether may join game [A]', () => {
		testGetAfterUpdate(GAME_IDENTIFIER_A, true);
	})

	it('can query whether may join game after update whether may join game [B]', () => {
		testGetAfterUpdate(GAME_IDENTIFIER_A, false);
	})

	it('can query whether may join game after update whether may join game [C]', () => {
		testGetAfterUpdate(GAME_IDENTIFIER_B, true);
	})

	it('can query whether may join game after update whether may join game [D]', () => {
		testGetAfterUpdate(GAME_IDENTIFIER_B, false);
	})



	const testUpdateAfterGet = function(game: string, mayJoin: boolean) {
		const expectedPath: string = MayJoinGameService.getApiMayJoinGamePath(game);
		const service: MayJoinGameService = setUp();

		service.get(game).subscribe(may => expect(may).toEqual(mayJoin));
		service.update(game);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].event(new HttpResponse<boolean>({ body: mayJoin }));
		expect(requests[1].request.method).toEqual('GET');
		requests[1].event(new HttpResponse<boolean>({ body: mayJoin }));
		httpTestingController.verify();
	};

	it('can update whether may join game after query whether may join game [A]', () => {
		testUpdateAfterGet(GAME_IDENTIFIER_A, false);
	})

	it('can update whether may join game after query whether may join game [B]', () => {
		testUpdateAfterGet(GAME_IDENTIFIER_A, true);
	})

	it('can update whether may join game after query whether may join game [C]', () => {
		testUpdateAfterGet(GAME_IDENTIFIER_B, false);
	})

	it('can update whether may join game after query whether may join game [D]', () => {
		testUpdateAfterGet(GAME_IDENTIFIER_B, true);
	})



	const testGetForChangingValue = function(
		done: any,
		game: string,
		may1: boolean
	) {
		const may2: boolean = !may1;
		const expectedPath: string = MayJoinGameService.getApiMayJoinGamePath(game);
		const service: MayJoinGameService = setUp();
    let n: number = 0;

    service.get(game).subscribe(
			() => {
				n++;
				if (n == 2) done();
			}
		);
		service.update(game);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].event(new HttpResponse<boolean>({ body: may1 }));
		expect(requests[1].request.method).toEqual('GET');
		requests[1].event(new HttpResponse<boolean>({ body: may2 }));
		httpTestingController.verify();
	};

	it('provides updated may join query results [A]', (done) => {
		testGetForChangingValue(done, GAME_IDENTIFIER_A, true);
	})

	it('provides updated may join query results [B]', (done) => {
		testGetForChangingValue(done, GAME_IDENTIFIER_B, false);
	})



	const testGetForUnchangedUpdate = function(game: string, may: boolean) {
		const expectedPath: string = MayJoinGameService.getApiMayJoinGamePath(game);
		const service: MayJoinGameService = setUp();
    let n: number = 0;

    service.get(game).subscribe(
			() => {
				n++;
				expect(n).withContext('number emitted').toEqual(1);
			}
		);
		service.update(game);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].event(new HttpResponse<boolean>({ body: may }));
		expect(requests[1].request.method).toEqual('GET');
		requests[1].event(new HttpResponse<boolean>({ body: may }));
		httpTestingController.verify();
	};

	it('provides distinct may join query results [A]', () => {
		testGetForUnchangedUpdate(GAME_IDENTIFIER_A, false);
	})

	it('provides distinct may join query results [B]', () => {
		testGetForUnchangedUpdate(GAME_IDENTIFIER_B, true);
	})

});
