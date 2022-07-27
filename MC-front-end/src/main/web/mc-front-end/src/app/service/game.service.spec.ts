import {v4 as uuid} from 'uuid';
import {Observable} from 'rxjs';

import {HttpClient} from '@angular/common/http';

import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import {AbstractGameBackEndService} from './abstract.game.back-end.service';
import {AbstractSelfService} from './abstract.self.service';
import {EncodedGame, HttpGameBackEndService} from './http.game.back-end.service';
import {Game} from '../game';
import {GameIdentifier} from '../game-identifier';
import {GameService} from './game.service';
import {User} from '../user';
import {UserDetails} from '../user-details';
import {MockSelfService} from "./mock/mock.self.service";


describe('GameService', () => {
  let httpTestingController: HttpTestingController;
  let selfService: AbstractSelfService;

  const SCENARIO_A: string = uuid();
  const SCENARIO_B: string = uuid();
  const CREATED_A = '1970-01-01T00:00:00.000Z';
  const CREATED_B = '2020-12-31T23:59:59.999Z';
  const USER_ID_A: string = uuid();
  const USER_ID_B: string = uuid();
  const CHARACTER_ID_A: string = uuid();
  const CHARACTER_ID_B: string = uuid();
  const GAME_IDENTIFIER_A: GameIdentifier = {scenario: SCENARIO_A, created: CREATED_A};
  const GAME_IDENTIFIER_B: GameIdentifier = {scenario: SCENARIO_B, created: CREATED_B};
  const USERS_A: Map<string, string> = new Map([
    [CHARACTER_ID_A, USER_ID_A],
    [CHARACTER_ID_B, USER_ID_B]
  ]);
  const USERS_B: Map<string, string> = new Map([]);
  const GAME_A: Game = new Game(GAME_IDENTIFIER_A, 'WAITING_TO_START', true, USERS_A);
  const GAME_B: Game = new Game(GAME_IDENTIFIER_B, 'RUNNING', false, USERS_B);

  const USER_DETAILS_A: UserDetails = {username: 'User A', password: 'passwordA', authorities: ['ROLE_PLAYER']};
  const USER_DETAILS_B: UserDetails = {
    username: 'User B',
    password: 'passwordB',
    authorities: ['ROLE_PLAYER', 'ROLE_MANAGE_GAMES']
  };
  const USER_A: User = new User(USER_ID_A, USER_DETAILS_A);
  const USER_B: User = new User(USER_ID_B, USER_DETAILS_B);

  const setUp = (self: User | null): GameService => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    selfService = new MockSelfService(self);
    const httpClient: HttpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    const backEnd: AbstractGameBackEndService = new HttpGameBackEndService(httpClient);
    return new GameService(selfService, backEnd);
  };

  it('should be created', () => {
    const service: GameService = setUp(USER_A);
    expect(service).toBeTruthy();
  });


  const testGetGame = (game: Game) => {
    const service: GameService = setUp(USER_A);

    service.get(game.identifier).subscribe(g => expect(g).toEqual(game));

    const request = httpTestingController.expectOne(GameService.getApiGamePath(game.identifier));
    expect(request.request.method).toEqual('GET');
    request.flush(encode(game));
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
    const service: GameService = setUp(USER_A);

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


  const testStartGame = (done: any, identifier: GameIdentifier) => {
    const game: Game = new Game(identifier, 'RUNNING', false, USERS_A);
    const service: GameService = setUp(USER_A);

    service.startGame(identifier);

    const request = httpTestingController.expectOne(HttpGameBackEndService.getApiStartGamePath(identifier));
    expect(request.request.method).toEqual('POST');
    request.flush(game);
    httpTestingController.verify();

    service.get(identifier).subscribe({
      next: (g) => {
        expect(g).withContext('game').not.toBeNull();
        expect(g).withContext('game').toEqual(game);
        done();
      }, error: (e) => {
        fail(e);
      }, complete: () => {
      }
    });
  };

  it('can start game [A]', (done) => {
    testStartGame(done, GAME_IDENTIFIER_A);
  });

  it('can start game [B]', (done) => {
    testStartGame(done, GAME_IDENTIFIER_B);
  });


  const testStopGame = (done: any, identifier: GameIdentifier) => {
    const game: Game = new Game(identifier, 'STOPPED', false, USERS_A);
    const service: GameService = setUp(USER_A);

    service.stopGame(identifier);

    const request = httpTestingController.expectOne(HttpGameBackEndService.getApiStopGamePath(identifier));
    expect(request.request.method).toEqual('POST');
    request.flush(game);
    httpTestingController.verify();

    service.get(identifier).subscribe({
      next: (g) => {
        expect(g).withContext('game').not.toBeNull();
        expect(g).withContext('game').toEqual(game);
        done();
      }, error: (e) => {
        fail(e);
      }, complete: () => {
      }
    });
  };

  it('can stop game [A]', (done) => {
    testStopGame(done, GAME_IDENTIFIER_A);
  });

  it('can stop game [B]', (done) => {
    testStopGame(done, GAME_IDENTIFIER_B);
  });

  const encode = (game: Game): EncodedGame => {
    const users = {};
    game.users.forEach((value, key) => users[key] = value);
    return {identifier: game.identifier, runState: game.runState, recruiting: game.recruiting, users};
  };


  const testJoinGame = (done: any, game0: Game, user: User) => {
    const identifier: GameIdentifier = game0.identifier;
    const expectedPath: string = HttpGameBackEndService.getApiJoinGamePath(identifier);
    const users: Map<string, string> = game0.users;
    users.set(CHARACTER_ID_A, user.id);
    // Tough test: the reply identifier is not the same object
    const game1: Game = new Game(
      {scenario: identifier.scenario, created: identifier.created},
      game0.runState,
      game0.recruiting,
      users
    );
    const service: GameService = setUp(user);

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
      }, error: (e) => {
        fail(e);
      }, complete: () => {
      }
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
    const path: string = HttpGameBackEndService.getApiGameEndRecruitmentPath(identifier);
    const service: GameService = setUp(USER_B);
    // Tough test: the reply identifier is not the same object
    const gameReply: Game = new Game(
      {scenario: identifier.scenario, created: identifier.created},
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
      }, error: (e) => {
        fail(e);
      }, complete: () => {
      }
    });
  };

  it('can end recruitment [A]', (done) => {
    testEndRecruitment(done, GAME_A);
  });

  it('can end recruitment [B]', (done) => {
    testEndRecruitment(done, GAME_B);
  });

});
