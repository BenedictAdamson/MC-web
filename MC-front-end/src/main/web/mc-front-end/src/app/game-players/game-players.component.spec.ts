/* eslint-disable prefer-arrow/prefer-arrow-functions */
import {of} from 'rxjs';
import {v4 as uuid} from 'uuid';

import {ActivatedRoute, convertToParamMap} from '@angular/router';

import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {AbstractSelfService} from '../service/abstract.self.service';
import {AbstractGamePlayersBackEndService} from '../service/abstract.game-players.back-end.service';
import {AbstractMayJoinGameBackEndService} from '../service/abstract.may-join-game.back-end.service';
import {AbstractScenarioBackEndService} from '../service/abstract.scenario.back-end.service';
import {GameIdentifier} from '../game-identifier';
import {GamePlayers} from '../game-players';
import {GamePlayersComponent} from './game-players.component';
import {GamePlayersService} from '../service/game-players.service';
import {MockGamePlayersBackEndService} from '../service/mock/mock.game-players.back-end.service';
import {MockMayJoinGameBackEndService} from '../service/mock/mock.may-join-game.back-end.service';
import {MayJoinGameService} from '../service/may-join-game.service';
import {MockScenarioBackEndService} from '../service/mock/mock.scenario.back-end.service';
import {MockSelfService} from '../service/mock/mock.self.service';
import {NamedUUID} from '../named-uuid';
import {Scenario} from '../scenario';
import {ScenarioService} from '../service/scenario.service';
import {User} from '../user';


describe('GamePlayersComponent', () => {
   let component: GamePlayersComponent;
   let fixture: ComponentFixture<GamePlayersComponent>;
   let selfService: AbstractSelfService;
   let gamePlayersService: GamePlayersService;
   let mayJoinGameService: MayJoinGameService;
   let scenarioService: ScenarioService;

   const SCENARIO_ID_A: string = uuid();
   const SCENARIO_ID_B: string = uuid();
   const CREATED_A = '1970-01-01T00:00:00.000Z';
   const CREATED_B = '2020-12-31T23:59:59.999Z';
   const USER_ID_A: string = uuid();
   const USER_ID_B: string = uuid();
   const CHARACTER_ID_A: string = uuid();
   const CHARACTER_ID_B: string = uuid();
   const CHARACTER_A: NamedUUID = { id: uuid(), title: 'Sergeant' };
   const CHARACTER_B: NamedUUID = { id: uuid(), title: 'Private' };
   const SCENARIO_A: Scenario = new Scenario(
      SCENARIO_ID_A,
      'Section Attack',
      'Basic fire-and-movement tactical training.',
      [CHARACTER_A, CHARACTER_B]
   );
   const SCENARIO_B: Scenario = new Scenario(
      SCENARIO_ID_B,
      'Beach Assault',
      'Fast and deadly.',
      [CHARACTER_A]
   );
   const USER_ADMIN: User = { id: USER_ID_A, username: 'Allan', password: null, authorities: ['ROLE_MANAGE_GAMES'] };
   const USER_NORMAL: User = { id: USER_ID_B, username: 'Benedict', password: null, authorities: [] };
   const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_ID_A, created: CREATED_A };
   const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_ID_B, created: CREATED_B };
   const USERS_A: Map<string, string> = new Map([
      [CHARACTER_ID_A, USER_ID_A],
      [CHARACTER_ID_B, USER_ID_B]
   ]);
   const USERS_B: Map<string, string> = new Map([]);
   const GAME_PLAYERS_A: GamePlayers = new GamePlayers(GAME_IDENTIFIER_A, true, USERS_A);
   const GAME_PLAYERS_B: GamePlayers = new GamePlayers(GAME_IDENTIFIER_B, false, USERS_B);

   const getIdentifier = function(gp: GamePlayersComponent): GameIdentifier | null {
      let identifier: GameIdentifier | null = null;
      gp.identifier$.subscribe({
         next: (i) => identifier = i,
         error: (err) => fail(err),
         complete: () => { }
      });
      return identifier;
   };

   const getGamePlayers = function(gp: GamePlayersComponent): GamePlayers | null {
      let gamePlayers: GamePlayers | null = null;
      gp.gamePlayers$.subscribe({
         next: (gps) => gamePlayers = gps,
         error: (err) => fail(err),
         complete: () => { }
      });
      return gamePlayers;
   };

   const isPlaying = function(gp: GamePlayersComponent): boolean | null {
      let playing: boolean | null = null;
      gp.playing$.subscribe({
         next: (p) => playing = p,
         error: (err) => fail(err),
         complete: () => { }
      });
      return playing;
   };

   const getScenario = function(gp: GamePlayersComponent): Scenario | null {
      let scenario: Scenario | null = null;
      gp.scenario$.subscribe({
         next: (sc) => scenario = sc,
         error: (err) => fail(err),
         complete: () => { }
      });
      return scenario;
   };

   const getPlayedCharacters = function(gp: GamePlayersComponent): string[] | null {
      let playedCharacters: string[] | null = null;
      gp.playedCharacters$.subscribe({
         next: (pcs) => playedCharacters = pcs,
         error: (err) => fail(err),
         complete: () => { }
      });
      return playedCharacters;
   };



   const testPlayedCharacters = function(scenario: Scenario, gamePlayers: GamePlayers, expected: string[]) {
      const actual: string[] = GamePlayersComponent.playedCharacters(scenario, gamePlayers);
      expect(actual).toEqual(expected);
   };

   const testPlayedCharacters1 = function(character: NamedUUID, userId: string) {
      const scenario: Scenario = new Scenario(
          SCENARIO_A.identifier,
         SCENARIO_A.title,
          SCENARIO_A.description,
         [character]
      );
      const game: GameIdentifier = { scenario: scenario.identifier, created: GAME_IDENTIFIER_A.created };
      const users: Map<string, string> = new Map([[character.id, userId]]);
      const gamePlayers: GamePlayers = new GamePlayers(game, true, users);

      testPlayedCharacters(scenario, gamePlayers, [character.title]);
   };

   it('can join scenario and game players information [A]', () => {
      testPlayedCharacters1(CHARACTER_A, USER_ID_A);
   });

   it('can join scenario and game players information [B]', () => {
      testPlayedCharacters1(CHARACTER_B, USER_ID_B);
   });



   const setUp = function(gamePlayers: GamePlayers, self: User, mayJoinGame: boolean, scenario: Scenario) {
      selfService = new MockSelfService(self);
      const game: GameIdentifier = gamePlayers.game;
      const gamePlayersBackEndService: AbstractGamePlayersBackEndService = new MockGamePlayersBackEndService(gamePlayers, self.id);
      gamePlayersService = new GamePlayersService(selfService, gamePlayersBackEndService);
      const mayJoinGameBackEnd: AbstractMayJoinGameBackEndService = new MockMayJoinGameBackEndService(mayJoinGame);
      mayJoinGameService = new MayJoinGameService(mayJoinGameBackEnd);
      const scenarioBackEndService: AbstractScenarioBackEndService = new MockScenarioBackEndService([scenario]);
      scenarioService = new ScenarioService(scenarioBackEndService);

      TestBed.configureTestingModule({
         declarations: [GamePlayersComponent],
         providers: [{
            provide: ActivatedRoute,
            useValue: {
               parent: {
                  parent: {
                     paramMap: of(convertToParamMap({ scenario: game.scenario }))
                  },
                  paramMap: of(convertToParamMap({ created: game.created }))
               },
               snapshot: {
                  parent: {
                     parent: {
                        paramMap: convertToParamMap({ scenario: game.scenario })
                     },
                     paramMap: convertToParamMap({ created: game.created })
                  }
               }
            }
         },
         { provide: GamePlayersService, useValue: gamePlayersService },
         { provide: MayJoinGameService, useValue: mayJoinGameService },
         { provide: AbstractSelfService, useValue: selfService },
         { provide: ScenarioService, useValue: scenarioService }]
      });

      fixture = TestBed.createComponent(GamePlayersComponent);
      component = fixture.componentInstance;
      selfService = TestBed.inject(AbstractSelfService);
      selfService.checkForCurrentAuthentication().subscribe();
      fixture.detectChanges();
   };


   const assertInvariants = function() {
      expect(component).toBeTruthy();

      const html: HTMLElement = fixture.nativeElement;
      const recruitingElement: HTMLElement | null = html.querySelector('#recruiting');
      const joinableElement: HTMLElement | null = html.querySelector('#joinable');
      const playingElement: HTMLElement | null = html.querySelector('#playing');
      const endRecruitmentButton: HTMLButtonElement | null = html.querySelector('button#end-recruitment');
      const joinButton: HTMLButtonElement | null = html.querySelector('button#join');

      const joinableText: string = joinableElement ? joinableElement.innerText : '';

      expect(recruitingElement).withContext('recruiting element').not.toBeNull();
      expect(joinableElement).withContext('joinable element').not.toBeNull();
      expect(playingElement).withContext('playing element').not.toBeNull();
      expect(endRecruitmentButton).withContext('end-recruitment button').not.toBeNull();
      expect(joinButton).withContext('join button').not.toBeNull();

      expect(joinableText.includes('You may not join this game') || joinableText.includes('You may join this game'))
         .withContext('joinable element text reports a recognized message').toBeTrue();

      if (recruitingElement) {
         expect(recruitingElement.innerText)
           .withContext('recruiting element text mentions recruiting')
           .toMatch('[Rr]ecruiting');
      }
      if (joinableElement) {
         expect(joinableElement.innerText)
           .withContext('joinable element text mentions joining')
           .toMatch('[Jj]oin');
      }
      if (joinButton && joinableElement) {
         expect(joinButton.disabled === joinableText.includes('You may not join this game'))
            .withContext('whether join button is disabled is consistent with joinable text').toBeTrue();
      }
   };


   const canCreate = function(
      gamePlayers: GamePlayers, self: User, mayJoinGame: boolean, scenario: Scenario, expectedPlayedCharacters: string[] | null
   ) {
      const recruiting: boolean = gamePlayers.recruiting;
      const manager: boolean = self.authorities.includes('ROLE_MANAGE_GAMES');
      const mayEndRecruitment: boolean = recruiting && manager;
      const playing: boolean = gamePlayers.isPlaying(self.id);

      setUp(gamePlayers, self, mayJoinGame, scenario);
      tick();
      fixture.detectChanges();

      assertInvariants();

      expect(getIdentifier(component)).withContext('identifier$').toEqual(gamePlayers.game);
      expect(getGamePlayers(component)).withContext('gamePlayers$').toEqual(gamePlayers);
      expect(isPlaying(component)).withContext('playing').toEqual(playing);
      expect(getScenario(component)).withContext('scenario').toEqual(scenario);
      expect(getPlayedCharacters(component)).withContext('playedCharacters').toEqual(expectedPlayedCharacters);

      component.isEndRecruitmentDisabled$.subscribe(may => {
         expect(may).withContext(
            'end recruitment disabled if game is not recruiting or user is not authorised'
         ).toEqual(!mayEndRecruitment);
      });

      component.mayJoinGame$.subscribe(may => {
         expect(may).withContext('mayJoinGame').toEqual(mayJoinGame);
      });

      const html: HTMLElement = fixture.nativeElement;
      const recruitingElement: HTMLElement | null = html.querySelector('#recruiting');
      const joinableElement: HTMLElement | null = html.querySelector('#joinable');
      const playingElement: HTMLElement | null = html.querySelector('#playing');
      const endRecruitmentButton: HTMLButtonElement | null = html.querySelector('button#end-recruitment');
      const joinButton: HTMLButtonElement | null = html.querySelector('button#join');
      const playedCharactersElement: HTMLElement | null = html.querySelector('#played-characters');

      const recruitingText: string = recruitingElement ? recruitingElement.innerText : '';
      const joinableText: string = joinableElement ? joinableElement.innerText : '';
      const playingText: string = playingElement ? playingElement.innerText : '';

      expect(recruiting || recruitingText.includes('This game is not recruiting players'))
         .withContext('recruiting element text can indicate that not recruiting').toBeTrue();
      expect(!recruiting || recruitingText.includes('This game is recruiting players'))
         .withContext('recruiting element text can indicate that is recruiting').toBeTrue();
      expect(mayJoinGame || joinableText.includes('You may not join this game'))
         .withContext('joinable element text can indicate that not joinable').toBeTrue();
      expect(
         !mayJoinGame || joinableText.includes('You may join this game')
      ).withContext('joinable element text can indicate that is joinable').toBeTrue();
      expect(
         playing || playingText.includes('You are not playing this game')
      ).withContext('playing element text can indicate that not playing').toBeTrue();
      expect(
         !playing || playingText.includes('You are playing this game')
      ).withContext('playing element text can indicate that playing').toBeTrue();
      if (endRecruitmentButton) {
         expect(endRecruitmentButton.disabled).withContext('end-recuitment button is disabled').toEqual(!mayEndRecruitment);
      }
      if (joinButton) {
         expect(joinButton.disabled).withContext('join button is disabled').toEqual(!mayJoinGame);
      }
      expect(!!playedCharactersElement).withContext('Displayed played characters IFF manager').toEqual(manager);
   };

   it('can create [A]', fakeAsync(() => {
      canCreate(GAME_PLAYERS_A, USER_NORMAL, true, SCENARIO_A, []);
   }));

   it('can create [B]', fakeAsync(() => {
      canCreate(GAME_PLAYERS_B, USER_ADMIN, false, SCENARIO_B, []);
   }));

   it('can create [C]', fakeAsync(() => {
      canCreate(GAME_PLAYERS_B, USER_NORMAL, false, SCENARIO_B, []);
   }));

   const canCreateWithPlayer = function(character: NamedUUID, user: User) {
      const self: User = USER_ADMIN;
      const scenario: Scenario = new Scenario(
          SCENARIO_A.identifier,
          SCENARIO_A.title,
          SCENARIO_A.description,
          [character]
      );
      const game: GameIdentifier = { scenario: scenario.identifier, created: GAME_IDENTIFIER_A.created };
      const users: Map<string, string> = new Map([[character.id, user.id]]);
      const gamePlayers: GamePlayers = new GamePlayers(game, true, users);
      const expectedPlayedCharacters: string[] = [character.title];

      canCreate(gamePlayers, self, true, scenario, expectedPlayedCharacters);

      const html: HTMLElement = fixture.nativeElement;
      const playedCharactersElement: HTMLElement | null = html.querySelector('#played-characters');
      expect(playedCharactersElement).withContext('Displayed played characters element').not.toBeNull();
      const playedCharactersElementText: string = (playedCharactersElement as HTMLElement).innerText;
      expect(playedCharactersElementText).withContext('Played characters element includes character title').toContain(character.title);
   };

   it('can create with player [A]', fakeAsync(() => {
      canCreateWithPlayer(CHARACTER_A, USER_ADMIN);
   }));

   it('can create with player [A]', fakeAsync(() => {
      canCreateWithPlayer(CHARACTER_B, USER_ADMIN);
   }));

   it('can create with player [C]', fakeAsync(() => {
      canCreateWithPlayer(CHARACTER_A, USER_NORMAL);
   }));


   const canCreatePlaying = function(
      game: GameIdentifier, selfId: string, character: NamedUUID
   ) {
      const expectedPlayingText: string = 'You are playing this game as ' + character.title;
      const recruiting = false;
      const self: User = {
         id: selfId, username: USER_NORMAL.username,
         password: USER_NORMAL.password,
         authorities: ['ROLE_PLAYER']
      };
      const scenario: Scenario = new Scenario(
          game.scenario,
          SCENARIO_A.title,
          SCENARIO_A.description,
         [character]
      );
      const gamePlayers: GamePlayers = new GamePlayers(
         game,
         recruiting,
         new Map([[character.id, selfId]])
      );

      canCreate(gamePlayers, self, false, scenario, [character.title]);

      const html: HTMLElement = fixture.nativeElement;
      const playingElement: HTMLElement | null = html.querySelector('#playing');
      const playingText: string = playingElement ? playingElement.innerText : '';
      expect(playingText
      ).withContext('playing element text').toEqual(expectedPlayingText);
   };

   it('displays the played character [A]', fakeAsync(() => {
      canCreatePlaying(GAME_IDENTIFIER_A, USER_ID_A, CHARACTER_A);
   }));

   it('displays the played character [B]', fakeAsync(() => {
      canCreatePlaying(GAME_IDENTIFIER_B, USER_ID_B, CHARACTER_B);
   }));



   const testEndRecruitment = function(gamePlayers0: GamePlayers, scenario: Scenario) {
     setUp(gamePlayers0, USER_ADMIN, true, scenario);
      component.endRecruitment();
      tick();
      tick();
      fixture.detectChanges();

      assertInvariants();
      const html: HTMLElement = fixture.nativeElement;
      const recruitingElement: HTMLElement | null = html.querySelector('#recruiting');
      const endRecruitmentButton: HTMLButtonElement | null = html.querySelector('button#end-recruitment');

      const recruitingText: string = recruitingElement ? recruitingElement.innerText : '';
      expect(recruitingText.includes('This game is not recruiting players'))
         .withContext('recruiting element text indicates that not recruiting').toBeTrue();
      if (endRecruitmentButton) {
         expect(endRecruitmentButton.disabled).withContext('end-recruitment button is disabled').toBeTrue();
      }
   };

   it('can end recruitment [A]', fakeAsync((() => {
      testEndRecruitment(GAME_PLAYERS_A, SCENARIO_A);
   })));

   it('can end recruitment [B]', fakeAsync((() => {
      testEndRecruitment(GAME_PLAYERS_B, SCENARIO_B);
   })));

   const testJoinGame = function(gamePlayers0: GamePlayers, self: User, scenario: Scenario) {
      setUp(gamePlayers0, self, true, scenario);
      component.joinGame();
      tick();
      fixture.detectChanges();

      assertInvariants();
      const gamePlayers1: GamePlayers | null = getGamePlayers(component);
      expect(gamePlayers1).withContext('gamePlayers').not.toBeNull();
      if (gamePlayers1) {
         expect(gamePlayers1.isPlaying(self.id)).withContext('gamePlayers.users includes self').toBeTrue();
      }

      expect(isPlaying(component)).withContext('component flags user as playing').toBeTrue();


      const html: HTMLElement = fixture.nativeElement;
      const playingElement: HTMLElement | null = html.querySelector('#playing');
      const playingText: string = playingElement ? playingElement.innerText : '';
      expect(playingText.includes('You are playing this game')).withContext('Reports that user is playing');
   };

   it('can join game [A]', fakeAsync((() => {
      testJoinGame(GAME_PLAYERS_A, USER_ADMIN, SCENARIO_A);
   })));

   it('can join game [B]', fakeAsync((() => {
      testJoinGame(GAME_PLAYERS_B, USER_NORMAL, SCENARIO_B);
   })));
});
