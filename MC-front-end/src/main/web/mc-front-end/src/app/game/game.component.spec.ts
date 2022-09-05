import {of} from 'rxjs';
import {v4 as uuid} from 'uuid';

import {ActivatedRoute, convertToParamMap} from '@angular/router';

import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {AbstractGameBackEndService} from '../service/abstract.game.back-end.service';
import {AbstractScenarioBackEndService} from '../service/abstract.scenario.back-end.service';
import {AbstractSelfService} from '../service/abstract.self.service';
import {Game} from '../game';
import {GameComponent} from './game.component';
import {Scenario} from '../scenario';
import {User} from '../user';

import {MockGameBackEndService} from '../service/mock/mock.game.back-end.service';
import {MockScenarioBackEndService} from '../service/mock/mock.scenario.back-end.service';
import {MockSelfService} from '../service/mock/mock.self.service';
import {NamedUUID} from "../named-uuid";


describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let selfService: AbstractSelfService;

  const USER_ID_A: string = uuid();
  const USER_ID_B: string = uuid();
  const USER_ADMIN: User = {id: USER_ID_A, username: 'Allan', password: null, authorities: ['ROLE_MANAGE_GAMES']};
  const USER_PLAYER: User = {id: USER_ID_B, username: 'Benedict', password: null, authorities: ['ROLE_PLAYER']};

  const SCENARIO_ID_A: string = uuid();
  const SCENARIO_ID_B: string = uuid();
  const CREATED_A = '1970-01-01T00:00:00.000Z';
  const CREATED_B = '2020-12-31T23:59:59.999Z';
  const GAME_IDENTIFIER_A: string = uuid();
  const GAME_IDENTIFIER_B: string = uuid();
  const CHARACTER_A: NamedUUID = { id: uuid(), title: 'Sergeant' };
  const CHARACTER_B: NamedUUID = { id: uuid(), title: 'Private' };
  const SCENARIO_A: Scenario = new Scenario(
    SCENARIO_ID_A,
    'Section Attack',
    'Basic fire-and-movement tactical training.',
    [CHARACTER_A]
  );
  const SCENARIO_B: Scenario = new Scenario(
    SCENARIO_ID_B,
    'Beach Assault',
    'Fast and deadly.',
    [CHARACTER_A, CHARACTER_B]
  );

  const getGame = (gc: GameComponent): Game | null => {
    let game: Game | null = null;
    gc.game$.subscribe({
      next: (g) => game = g,
      error: (err) => fail(err),
      complete: () => {
      }
    });
    return game;
  };

  const getMayManageGames = (gc: GameComponent): boolean => {
    let may = false;
    gc.mayManageGames$.subscribe({
      next: (m) => may = m,
      error: (err) => fail(err),
      complete: () => {
      }
    });
    return may;
  };

  const getMayStart = (gc: GameComponent): boolean => {
    let may = false;
    gc.mayStart$.subscribe({
      next: (m) => may = m,
      error: (err) => fail(err),
      complete: () => {
      }
    });
    return may;
  };

  const getMayStop = (gc: GameComponent): boolean => {
    let may = false;
    gc.mayStop$.subscribe({
      next: (m) => may = m,
      error: (err) => fail(err),
      complete: () => {
      }
    });
    return may;
  };


  const setUp = (self: User, game: Game, scenario: Scenario) => {
    const gameServiceStub: AbstractGameBackEndService = new MockGameBackEndService([game], self.id);
    const scenarioServiceStub: AbstractScenarioBackEndService = new MockScenarioBackEndService([scenario]);
    selfService = new MockSelfService(self);

    const identifier: string = game.identifier;
    TestBed.configureTestingModule({
      declarations: [GameComponent],
      providers: [{
        provide: ActivatedRoute,
        useValue: {
          paramMap: of(convertToParamMap({game: identifier}))
        }
      },
        {provide: AbstractGameBackEndService, useValue: gameServiceStub},
        {provide: AbstractScenarioBackEndService, useValue: scenarioServiceStub},
        {provide: AbstractSelfService, useValue: selfService}
      ]
    });

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    selfService = TestBed.inject(AbstractSelfService);
    selfService.checkForCurrentAuthentication().subscribe();
    fixture.detectChanges();
  };


  const assertInvariants = () => {
    expect(component).toBeTruthy();

    const html: HTMLElement = fixture.nativeElement;
    const selfLink: HTMLAnchorElement | null = html.querySelector('a#game');
    const runState: HTMLElement | null = html.querySelector('#run-state');

    expect(selfLink).withContext('self link').not.toBeNull();
    expect(runState).withContext('run-state element').not.toBeNull();
  };


  const canCreate = (self: User, identifier: string, scenario: Scenario, created: string, runState: string,
                     expectedRunStateText: string, expectMayManageGames: boolean, expectMayStart: boolean, expectMayStop: boolean) => {
    const characterIdA: string = uuid();
    const characterIdB: string = uuid();
    const userIdA: string = uuid();
    const userIdB: string = uuid();
    const users: Map<string, string> = new Map([
      [characterIdA, userIdA],
      [characterIdB, userIdB]
    ]);
    const game: Game = new Game(identifier, scenario.identifier, created, runState, true, users);
    setUp(self, game, scenario);
    tick();
    fixture.detectChanges();

    assertInvariants();

    expect(getGame(component)).withContext('game').toBe(game);
    expect(getMayManageGames(component)).withContext('mayManageGames').toEqual(expectMayManageGames);
    expect(getMayStart(component)).withContext('mayStart').toEqual(expectMayStart);
    expect(getMayStop(component)).withContext('mayStop').toEqual(expectMayStop);

    const html: HTMLElement = fixture.nativeElement;
    const scenarioElement: HTMLElement | null = html.querySelector('#scenario');
    const runStateElement: HTMLElement | null = html.querySelector('#run-state');
    const startButton: HTMLButtonElement | null = html.querySelector('button#start');
    const stopButton: HTMLButtonElement | null = html.querySelector('button#stop');

    expect(scenarioElement).withContext('scenario element').not.toBeNull();
    expect(runStateElement).withContext('run-state element').not.toBeNull();
    expect(startButton != null).withContext('has start button').toEqual(expectMayStart);
    expect(stopButton != null).withContext('has stop button').toEqual(expectMayStop);

    const displayText: string = html.innerText;
    const scenarioText: string | null = scenarioElement ? scenarioElement.innerText : null;
    const runStateText: string | null = runStateElement ? runStateElement.innerText : null;
    const startButtonText: string | null = startButton ? startButton.innerText : null;
    const stopButtonText: string | null = stopButton ? stopButton.innerText : null;

    expect(displayText.includes(game.created))
      .withContext('The game page includes the date and time that the game was set up').toBeTrue();
    expect(scenarioText)
      .withContext('Scenario text').toContain(scenario.title);
    expect(runStateText)
      .withContext('Run-state text').toEqual(expectedRunStateText);
    if (expectMayStart) {
      expect(startButtonText)
        .withContext('Start-button text text').toEqual('Start');
    }
    if (expectMayStop) {
      expect(stopButtonText)
        .withContext('Stop-button text text').toEqual('Stop');
    }
  };

  it('can create [admin, waiting to start]', fakeAsync(() => {
    canCreate(USER_ADMIN, GAME_IDENTIFIER_A, SCENARIO_A, CREATED_A, 'WAITING_TO_START', 'waiting to start', true, true, false);
  }));

  it('can create [player, waiting to start]', fakeAsync(() => {
    canCreate(USER_PLAYER, GAME_IDENTIFIER_B, SCENARIO_B, CREATED_B, 'WAITING_TO_START', 'waiting to start', false, false, false);
  }));

  it('can create [admin, running]', fakeAsync(() => {
    canCreate(USER_ADMIN, GAME_IDENTIFIER_A, SCENARIO_A, CREATED_A, 'RUNNING', 'running', true, false, true);
  }));

  it('can create [player, running]', fakeAsync(() => {
    canCreate(USER_PLAYER, GAME_IDENTIFIER_A, SCENARIO_A, CREATED_A, 'RUNNING', 'running', false, false, false);
  }));

  it('can create [admin, stopped]', fakeAsync(() => {
    canCreate(USER_ADMIN, GAME_IDENTIFIER_A, SCENARIO_A, CREATED_A, 'STOPPED', 'stopped', true, false, false);
  }));

  it('can create [player, stopped]', fakeAsync(() => {
    canCreate(USER_PLAYER, GAME_IDENTIFIER_A, SCENARIO_A, CREATED_A, 'STOPPED', 'stopped', false, false, false);
  }));


  const testStartGame = (identifier: string, scenario: Scenario, created: string) => {
    const self: User = USER_ADMIN;
    const runState0 = 'WAITING_TO_START';
    const characterIdA: string = uuid();
    const characterIdB: string = uuid();
    const userIdA: string = uuid();
    const userIdB: string = uuid();
    const users: Map<string, string> = new Map([
      [characterIdA, userIdA],
      [characterIdB, userIdB]
    ]);
    const game0: Game = new Game(identifier, scenario.identifier, created, runState0, true, users);
    setUp(self, game0, scenario);

    component.startGame();
    tick();
    fixture.detectChanges();

    assertInvariants();

    const game: Game | null = getGame(component);
    const runState: string | null = game ? game.runState : null;
    expect(game).withContext('game').not.toBeNull();
    expect(runState).withContext('runState').toBe('RUNNING');
    expect(getMayStart(component)).withContext('mayStart').toEqual(false);
    expect(getMayStop(component)).withContext('mayStop').toEqual(true);

    const html: HTMLElement = fixture.nativeElement;
    const runStateElement: HTMLElement | null = html.querySelector('#run-state');
    const startButton: HTMLButtonElement | null = html.querySelector('button#start');
    const stopButton: HTMLButtonElement | null = html.querySelector('button#stop');

    expect(runStateElement).withContext('run-state element').not.toBeNull();
    expect(startButton != null).withContext('has start button').toBeFalse();
    expect(stopButton != null).withContext('has stop button').toBeTrue();
  };

  it('can start [A]', fakeAsync(() => {
    testStartGame(GAME_IDENTIFIER_A, SCENARIO_A, CREATED_A);
  }));

  it('can start [B]', fakeAsync(() => {
    testStartGame(GAME_IDENTIFIER_B, SCENARIO_B, CREATED_B);
  }));


  const testStopGame = (identifier: string, scenario: Scenario, created: string) => {
    const self: User = USER_ADMIN;
    const runState0 = 'RUNNING';
    const characterIdA: string = uuid();
    const characterIdB: string = uuid();
    const userIdA: string = uuid();
    const userIdB: string = uuid();
    const users: Map<string, string> = new Map([
      [characterIdA, userIdA],
      [characterIdB, userIdB]
    ]);
    const game0: Game = new Game(identifier, scenario.identifier, created, runState0, true, users);
    setUp(self, game0, scenario);

    component.stopGame();
    tick();
    fixture.detectChanges();

    assertInvariants();

    const game: Game | null = getGame(component);
    const runState: string | null = game ? game.runState : null;
    expect(game).withContext('game').not.toBeNull();
    expect(runState).withContext('runState').toBe('STOPPED');
    expect(getMayStart(component)).withContext('mayStart').toBeFalse();
    expect(getMayStop(component)).withContext('mayStop').toBeFalse();

    const html: HTMLElement = fixture.nativeElement;
    const runStateElement: HTMLElement | null = html.querySelector('#run-state');
    const startButton: HTMLButtonElement | null = html.querySelector('button#start');
    const stopButton: HTMLButtonElement | null = html.querySelector('button#stop');

    expect(runStateElement).withContext('run-state element').not.toBeNull();
    expect(startButton != null).withContext('has start button').toBeFalse();
    expect(stopButton != null).withContext('has stop button').toBeFalse();
  };

  it('can stop [A]', fakeAsync(() => {
    testStopGame(GAME_IDENTIFIER_A, SCENARIO_A, CREATED_A);
  }));

  it('can stop [B]', fakeAsync(() => {
    testStopGame(GAME_IDENTIFIER_B, SCENARIO_B, CREATED_B);
  }));

});
