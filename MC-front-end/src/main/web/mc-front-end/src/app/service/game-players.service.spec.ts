import {v4 as uuid} from 'uuid';

import {HttpClient} from '@angular/common/http';

import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController, TestRequest} from '@angular/common/http/testing';

import {AbstractGamePlayersBackEndService} from './abstract.game-players.back-end.service';
import {AbstractSelfService} from './abstract.self.service';
import {CURRENTGAMEPATH, EncodedGamePlayers, HttpGamePlayersBackEndService} from './http.game-players.back-end.service';
import {Game} from '../game';
import {GameIdentifier} from '../game-identifier';
import {GamePlayersService} from './game-players.service';
import {User} from '../user';
import {UserDetails} from '../user-details';

import {MockSelfService} from './mock/mock.self.service';


describe('GamePlayersService', () => {
   let httpTestingController: HttpTestingController;
   let selfService: AbstractSelfService;

   const SCENARIO_A: string = uuid();
   const SCENARIO_B: string = uuid();
   const USER_ID_A: string = uuid();
   const USER_ID_B: string = uuid();
   const CHARACTER_ID_A: string = uuid();
   const CHARACTER_ID_B: string = uuid();
   const CREATED_A = '1970-01-01T00:00:00.000Z';
   const CREATED_B = '2020-12-31T23:59:59.999Z';
   const IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_A, created: CREATED_A };
   const IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_B, created: CREATED_B };
   const USERS_A: Map<string, string> = new Map([
      [CHARACTER_ID_A, USER_ID_A],
      [CHARACTER_ID_B, USER_ID_B]
   ]);
   const USERS_B: Map<string, string> = new Map([]);
   const GAME_A: Game = new Game(IDENTIFIER_A, 'WAITING_TO_START', true, USERS_A);
   const GAME_B: Game = new Game(IDENTIFIER_B, 'RUNNING', false, USERS_B);

   const USER_DETAILS_A: UserDetails = { username: 'User A', password: 'passwordA', authorities: ['ROLE_PLAYER'] };
   const USER_DETAILS_B: UserDetails = { username: 'User B', password: 'passwordB', authorities: ['ROLE_PLAYER', 'ROLE_MANAGE_GAMES'] };
   const USER_A: User = new User(USER_ID_A, USER_DETAILS_A);
   const USER_B: User = new User(USER_ID_B, USER_DETAILS_B);

   const setUp = (
      self: User | null): GamePlayersService => {
      TestBed.configureTestingModule({
         imports: [HttpClientTestingModule]
      });

      selfService = new MockSelfService(self);
      const httpClient: HttpClient = TestBed.inject(HttpClient);
      httpTestingController = TestBed.inject(HttpTestingController);
      const backEnd: AbstractGamePlayersBackEndService = new HttpGamePlayersBackEndService(httpClient);
      return new GamePlayersService(selfService, backEnd);
   };

   it('should be created', () => {
      const service: GamePlayersService = setUp(USER_A);
      expect(service).toBeTruthy();
   });

   const encode = (game: Game): EncodedGamePlayers => {
      const users = {};
      game.users.forEach((value, key) => users[key] = value);
     return {identifier: game.identifier, runState: game.runState, recruiting: game.recruiting, users};
   };

   const testGet = (game: Game) => {
      const expectedPath: string = HttpGamePlayersBackEndService.getApiGamePlayersPath(game.identifier);
      const service: GamePlayersService = setUp(USER_A);

      service.get(game.identifier).subscribe(g => expect(g).toEqual(game));

      const request = httpTestingController.expectOne(expectedPath);
      expect(request.request.method).toEqual('GET');
      request.flush(encode(game));
      httpTestingController.verify();
   };

   it('can get game players [A]', () => {
      testGet(GAME_A);
   });

   it('can get game players [B]', () => {
      testGet(GAME_B);
   });


   const testJoinGame = (done: any, game0: Game, user: User) => {
      const identifier: GameIdentifier = game0.identifier;
      const expectedPath: string = HttpGamePlayersBackEndService.getApiJoinGamePath(identifier);
      const users: Map<string, string> = game0.users;
      users.set(CHARACTER_ID_A, user.id);
      // Tough test: the reply identifier is not the same object
      const game1: Game = new Game(
         { scenario: identifier.scenario, created: identifier.created },
         game0.runState,
         game0.recruiting,
         users
      );
      const service: GamePlayersService = setUp(user);

      service.joinGame(identifier);

      const request = httpTestingController.expectOne(expectedPath);
      expect(request.request.method).toEqual('POST');
      request.flush(encode(game1));
      httpTestingController.verify();

      service.get(identifier).subscribe({
         next: (gps) => {
            expect(gps).withContext('gamePlayers').not.toBeNull();
            expect(gps).withContext('gamePlayers').toEqual(game1);
            done();
         }, error: (e) => { fail(e); }, complete: () => { }
      });
   };

   it('can join game [A]', (done) => {
      testJoinGame(done, GAME_A, USER_A);
   });

   it('can join game [B]', (done) => {
      testJoinGame(done, GAME_B, USER_B);
   });


   const testEndRecruitment = (done: any, game0: Game) => {
      const identifier: GameIdentifier = game0.identifier;
      const path: string = HttpGamePlayersBackEndService.getApiGameEndRecruitmentPath(identifier);
      const service: GamePlayersService = setUp(USER_B);
      // Tough test: the reply identifier is not the same object
      const gameReply: Game = new Game(
         { scenario: identifier.scenario, created: identifier.created },
         game0.runState,
         false,
         game0.users
      );

      service.endRecruitment(identifier);

      const request = httpTestingController.expectOne(path);
      expect(request.request.method).toEqual('POST');
      request.flush(encode(gameReply));
      httpTestingController.verify();

      service.get(identifier).subscribe({
         next: (gps) => {
            expect(gps).withContext('gamePlayers').not.toBeNull();
            expect(gps).withContext('gamePlayers').toEqual(gameReply);
            done();
         }, error: (e) => { fail(e); }, complete: () => { }
      });
   };

   it('can end recuitment [A]', (done) => {
      testEndRecruitment(done, GAME_A);
   });

   it('can end recuitment [B]', (done) => {
      testEndRecruitment(done, GAME_B);
   });



   const testGetAfterUpdate = (game: Game) => {
      // Tough test: use two identifiers that are semantically equivalent, but not the same object.
      const identifier1: GameIdentifier = game.identifier;
      const identifier2: GameIdentifier = { scenario: identifier1.scenario, created: identifier1.created };
      const expectedPath: string = HttpGamePlayersBackEndService.getApiGamePlayersPath(identifier1);
      const service: GamePlayersService = setUp(USER_A);

      service.update(identifier1);
      service.get(identifier2).subscribe(g => expect(g).toEqual(game));

      // Only one GET expected because should use the cached value.
      const request = httpTestingController.expectOne(expectedPath);
      expect(request.request.method).toEqual('GET');
      request.flush(encode(game));
      httpTestingController.verify();
   };

   it('can get game players after update game players [A]', () => {
      testGetAfterUpdate(GAME_A);
   });

   it('can get game players after update game players [B]', () => {
      testGetAfterUpdate(GAME_B);
   });



   const testUpdateAfterGet = (game: Game) => {
      const identifier: GameIdentifier = game.identifier;
      const expectedPath: string = HttpGamePlayersBackEndService.getApiGamePlayersPath(identifier);
      const service: GamePlayersService = setUp(USER_A);

      service.get(identifier).subscribe(g => expect(g).toEqual(game));
      service.update(identifier);

      const requests: TestRequest[] = httpTestingController.match(expectedPath);
      expect(requests.length).withContext('number of requests').toEqual(2);
      expect(requests[0].request.method).toEqual('GET');
      requests[0].flush(encode(game));
      expect(requests[1].request.method).toEqual('GET');
      requests[1].flush(encode(game));
      httpTestingController.verify();
   };

   it('can update game players after get game players [A]', () => {
      testUpdateAfterGet(GAME_A);
   });

   it('can update game players after get game players [B]', () => {
      testUpdateAfterGet(GAME_B);
   });



   const testGetForChangingValue = (
      done: any,
      identifier: GameIdentifier,
      recruiting1: boolean,
      users1: Map<string, string>,
      recruiting2: boolean,
      users2: Map<string, string>
   ) => {
      const game1: Game = new Game(identifier, 'WAITING_TO_START', recruiting1, users1);
      const game2: Game = new Game(identifier, 'WAITING_TO_START', recruiting2, users2);
      const expectedPath: string = HttpGamePlayersBackEndService.getApiGamePlayersPath(identifier);
      const service: GamePlayersService = setUp(USER_A);
      let n = 0;

      service.get(identifier).subscribe(
         gamePlayers => {
            if (n === 0) {
               expect(gamePlayers).withContext('first provided value').toEqual(game1);
               n++;
            } else if (n === 1) {
               expect(gamePlayers).withContext('second provided value').toEqual(game2);
               done();
            }
         }
      );
      service.update(identifier);

      const requests: TestRequest[] = httpTestingController.match(expectedPath);
      expect(requests.length).withContext('number of requests').toEqual(2);
      expect(requests[0].request.method).toEqual('GET');
      requests[0].flush(encode(game1));
      expect(requests[1].request.method).toEqual('GET');
      requests[1].flush(encode(game2));
      httpTestingController.verify();
   };

   it('provides updated game players [A]', (done) => {
      testGetForChangingValue(done, IDENTIFIER_A, true, new Map([]), false, new Map([[CHARACTER_ID_A, USER_ID_A]]));
   });

   it('provides updated game players [B]', (done) => {
      testGetForChangingValue(
         done, IDENTIFIER_B, true,
         new Map([[CHARACTER_ID_A, USER_ID_A]]), true,
         new Map([[CHARACTER_ID_B, USER_ID_B]])
      );
   });



   const testGetForUnchangedUpdate = (game: Game) => {
      const identifier: GameIdentifier = game.identifier;
      const expectedPath: string = HttpGamePlayersBackEndService.getApiGamePlayersPath(identifier);
      const service: GamePlayersService = setUp(USER_A);

      service.get(identifier).subscribe(
         gps => {
            expect(gps).withContext('provided value').toEqual(game);
         }
      );
      service.update(identifier);

      const requests: TestRequest[] = httpTestingController.match(expectedPath);
      expect(requests.length).withContext('number of requests').toEqual(2);
      expect(requests[0].request.method).toEqual('GET');
      requests[0].flush(encode(game));
      expect(requests[1].request.method).toEqual('GET');
      requests[1].flush(encode(game));
      httpTestingController.verify();
   };

   it('provides distinct game players [A]', () => {
      testGetForUnchangedUpdate(GAME_A);
   });

   it('provides distinct game players [B]', () => {
      testGetForUnchangedUpdate(GAME_B);
   });



   const testGetCurrentGameId = (currentGame: Game) => {
      const expectedPath: string = CURRENTGAMEPATH;
      const service: GamePlayersService = setUp(USER_A);

      service.getCurrentGameId().subscribe(g => expect(g).toEqual(currentGame.identifier));

      const request = httpTestingController.expectOne(expectedPath);
      expect(request.request.method).toEqual('GET');
      request.flush(currentGame);
      httpTestingController.verify();
   };

   it('can get current game ID [A]', () => {
      testGetCurrentGameId(GAME_A);
   });

   it('can get current game ID [B]', () => {
      testGetCurrentGameId(GAME_B);
   });

   it('can indicate have no current game ID', () => {
      const expectedPath: string = CURRENTGAMEPATH;
      const service: GamePlayersService = setUp(USER_A);

      service.getCurrentGameId().subscribe(g => expect(g).toBeNull());

      const request = httpTestingController.expectOne(expectedPath);
      expect(request.request.method).toEqual('GET');
      request.flush('', { status: 404, statusText: 'Not Found' });
      httpTestingController.verify();
   });


   it('caches current game ID [A]', () => {
      const currentGame: Game = GAME_A;
      const expectedPath: string = CURRENTGAMEPATH;
      const service: GamePlayersService = setUp(USER_A);

      service.getCurrentGameId().subscribe(g => expect(g).toEqual(currentGame.identifier));
      service.getCurrentGameId().subscribe(g => expect(g).toEqual(currentGame.identifier));

      const request = httpTestingController.expectOne(expectedPath);// does not repeat GET
      expect(request.request.method).toEqual('GET');
      request.flush(currentGame);
      httpTestingController.verify();
   });


   const testGetCurrentGameIdAfterJoinGame = (done: any, game0: Game, user: string) => {
      const identifier: GameIdentifier = game0.identifier;
      const expectedPath: string = HttpGamePlayersBackEndService.getApiJoinGamePath(identifier);
      const users: Map<string, string> = game0.users;
      users.set(CHARACTER_ID_A, user);
      // Tough test: the reply identifier is not the same object
      const game1: Game = new Game(
         { scenario: identifier.scenario, created: identifier.created },
         game0.runState,
         game0.recruiting,
         users
      );
      const service: GamePlayersService = setUp(USER_A);

      service.joinGame(identifier);

      const request = httpTestingController.expectOne(expectedPath);// should cache the ID
      expect(request.request.method).toEqual('POST');
      request.flush(encode(game1));
      httpTestingController.verify();

      service.getCurrentGameId().subscribe({
         next: (g) => {
            expect(g).toEqual(identifier);
            done();
         },
         error: (e) => { fail(e); },
         complete: () => { }
      });
   };

   it('can get current game ID after join game [A]', (done) => {
      testGetCurrentGameIdAfterJoinGame(done, GAME_A, USER_ID_A);
   });

   it('can get current game ID after join game [B]', (done) => {
      testGetCurrentGameIdAfterJoinGame(done, GAME_B, USER_ID_B);
   });


   const testUpdateCurrentGameId = (currentGame: Game) => {
      const expectedPath: string = CURRENTGAMEPATH;
      const service: GamePlayersService = setUp(USER_A);

      service.updateCurrentGameId();

      const request = httpTestingController.expectOne(expectedPath);
      expect(request.request.method).toEqual('GET');
      request.flush(currentGame);
      httpTestingController.verify();
   };

   it('can update current game ID [A]', () => {
      testUpdateCurrentGameId(GAME_A);
   });

   it('can update current game ID [B]', () => {
      testUpdateCurrentGameId(GAME_B);
   });


   const testGetAfterUpdateCurrentGameId = (currentGame: Game) => {
      const expectedPath: string = CURRENTGAMEPATH;
      const service: GamePlayersService = setUp(USER_A);

      service.updateCurrentGameId();
      service.getCurrentGameId().subscribe(g => expect(g).toEqual(currentGame.identifier));

      const request = httpTestingController.expectOne(expectedPath);// should use cached value
      expect(request.request.method).toEqual('GET');
      request.flush(currentGame);
      httpTestingController.verify();
   };

   it('can get after update of current game ID [A]', () => {
      testGetAfterUpdateCurrentGameId(GAME_A);
   });

   it('can get after update of current game ID [B]', () => {
      testGetAfterUpdateCurrentGameId(GAME_B);
   });


   const testChangeUser = (currentGameA: Game, userA: User, currentGameB: Game, userB: User) => {
      const expectedPath: string = CURRENTGAMEPATH;
      const service: GamePlayersService = setUp(userA);
      service.getCurrentGameId().subscribe(
         g => expect(g === currentGameA.identifier || g === currentGameB.identifier).toBeTrue()
         );

      selfService.setUser(userB, true);

      // Should update the (cached) currentGameId
      const requests: TestRequest[] = httpTestingController.match(expectedPath);
      expect(requests.length).withContext('number of requests').toEqual(2);
      expect(requests[0].request.method).toEqual('GET');
      requests[0].flush(currentGameA);
      expect(requests[1].request.method).toEqual('GET');
      requests[1].flush(currentGameB);
      httpTestingController.verify();
   };

   it('updates current game ID when user changes [A]', () => {
      testChangeUser(GAME_A, USER_A, GAME_B, USER_B);
   });

   it('updates current game ID when user changes [B]', () => {
      testChangeUser(GAME_B, USER_B, GAME_A, USER_A);
   });
});
