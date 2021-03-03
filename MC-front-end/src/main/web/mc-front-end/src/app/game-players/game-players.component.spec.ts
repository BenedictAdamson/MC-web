/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { AbstractSelfService } from '../service/abstract.self.service';
import { AbstractGamePlayersBackEndService } from '../service/abstract.game-players.back-end.service';
import { AbstractMayJoinGameBackEndService } from '../service/abstract.may-join-game.back-end.service';
import { GameIdentifier } from '../game-identifier';
import { GamePlayers } from '../game-players';
import { GamePlayersComponent } from './game-players.component';
import { GamePlayersService } from '../service/game-players.service';
import { MockGamePlayersBackEndService } from '../service/mock/mock.game-players.back-end.service';
import { MockMayJoinGameBackEndService } from '../service/mock/mock.may-join-game.back-end.service';
import { MayJoinGameService } from '../service/may-join-game.service';
import { MockSelfService } from '../service/mock/mock.self.service';
import { User } from '../user';


describe('GamePlayersComponent', () => {
	let component: GamePlayersComponent;
	let fixture: ComponentFixture<GamePlayersComponent>;
	let selfService: AbstractSelfService;
	let gamePlayersService: GamePlayersService;
	let mayJoinGameService: MayJoinGameService;

	const SCENARIO_ID_A: string = uuid();
	const SCENARIO_ID_B: string = uuid();
	const CREATED_A = '1970-01-01T00:00:00.000Z';
	const CREATED_B = '2020-12-31T23:59:59.999Z';
	const USER_ID_A: string = uuid();
	const USER_ID_B: string = uuid();
	const CHARACTER_ID_A: string = uuid();
	const CHARACTER_ID_B: string = uuid();
	const USER_ADMIN: User = { id: USER_ID_A, username: 'Allan', password: null, authorities: ['ROLE_MANAGE_GAMES'] };
	const USER_NORMAL: User = { id: USER_ID_B, username: 'Benedict', password: null, authorities: [] };
	const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_ID_A, created: CREATED_A };
	const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_ID_B, created: CREATED_B };
	const USERS_A: Map<string,string> = new Map([
		[CHARACTER_ID_A, USER_ID_A],
		[CHARACTER_ID_B, USER_ID_B]
	]);
	const USERS_B: Map<string,string> = new Map([]);
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



	const setUp = function(gamePlayers: GamePlayers, self: User, mayJoinGame: boolean) {
		const game: GameIdentifier = gamePlayers.game;
		const gamePlayersBackEndService: AbstractGamePlayersBackEndService = new MockGamePlayersBackEndService(gamePlayers, self.id);
		gamePlayersService = new GamePlayersService(gamePlayersBackEndService);
		const mayJoinGameBackEnd: AbstractMayJoinGameBackEndService = new MockMayJoinGameBackEndService(mayJoinGame);
		mayJoinGameService = new MayJoinGameService(mayJoinGameBackEnd);

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
			{ provide: AbstractSelfService, useFactory: () => new MockSelfService(self) }]
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
		const playersElement: HTMLElement | null = html.querySelector('#players');
		const playingElement: HTMLElement | null = html.querySelector('#playing');
		const endRecuitmentButton: HTMLButtonElement | null = html.querySelector('button#end-recruitment');
		const joinButton: HTMLButtonElement | null = html.querySelector('button#join');

		const joinableText: string = joinableElement ? joinableElement.innerText : '';

		expect(recruitingElement).withContext('recruiting element').not.toBeNull();
		expect(joinableElement).withContext('joinable element').not.toBeNull();
		expect(playersElement).withContext('players element').not.toBeNull();
		expect(playingElement).withContext('playing element').not.toBeNull();
		expect(endRecuitmentButton).withContext('end-recuitment button').not.toBeNull();
		expect(joinButton).withContext('join button').not.toBeNull();

		expect(joinableText.includes('You may not join this game') || joinableText.includes('You may join this game'))
			.withContext('joinable element text reports a recognized message').toBeTrue();

		if (recruitingElement) {
			expect(recruitingElement.innerText).withContext('recruiting element text mentions recruiting').toMatch('[Rr]ecruiting');
		}
		if (joinableElement) {
			expect(joinableElement.innerText).withContext('joinable element text mentions joining').toMatch('[Jj]oin');
		}
		if (joinButton && joinableElement) {
			expect(joinButton.disabled === joinableText.includes('You may not join this game'))
				.withContext('whether join button is disabled is consistent with joinable text').toBeTrue();
		}
	};


	const canCreate = function(gamePlayers: GamePlayers, self: User, mayJoinGame: boolean) {
		const recruiting: boolean = gamePlayers.recruiting;
		const manager: boolean = self.authorities.includes('ROLE_MANAGE_GAMES');
		const mayEndRecuitment: boolean = recruiting && manager;
		const playing: boolean = gamePlayers.isPlaying(self.id);

		setUp(gamePlayers, self, mayJoinGame);
		tick();
		fixture.detectChanges();

		assertInvariants();

		expect(getIdentifier(component)).withContext('identifier$').toEqual(gamePlayers.game);
		expect(getGamePlayers(component)).withContext('gamePlayers$').toEqual(gamePlayers);
		expect(isPlaying(component)).withContext('playing').toEqual(playing);

		component.isEndRecruitmentDisabled$.subscribe(may => {
			expect(may).withContext(
				'end recuitment disabled if game is not recuiting or user is not authorised'
			).toEqual(!mayEndRecuitment);
		});

		component.mayJoinGame$.subscribe(may => {
			expect(may).withContext('mayJoinGame').toEqual(mayJoinGame);
		});

		const html: HTMLElement = fixture.nativeElement;
		const recruitingElement: HTMLElement | null = html.querySelector('#recruiting');
		const joinableElement: HTMLElement | null = html.querySelector('#joinable');
		const playingElement: HTMLElement | null = html.querySelector('#playing');
		const endRecuitmentButton: HTMLButtonElement | null = html.querySelector('button#end-recruitment');
		const joinButton: HTMLButtonElement | null = html.querySelector('button#join');

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
		if (endRecuitmentButton) {
			expect(endRecuitmentButton.disabled).withContext('end-recuitment button is disabled').toEqual(!mayEndRecuitment);
		}
		if (joinButton) {
			expect(joinButton.disabled).withContext('join button is disabled').toEqual(!mayJoinGame);
		}
	};

	it('can create [A]', fakeAsync(() => {
		canCreate(GAME_PLAYERS_A, USER_ADMIN, true);
	}));

	it('can create [B]', fakeAsync(() => {
		canCreate(GAME_PLAYERS_A, USER_NORMAL, true);
	}));

	it('can create [C]', fakeAsync(() => {
		canCreate(GAME_PLAYERS_B, USER_ADMIN, false);
	}));

	it('can create [D]', fakeAsync(() => {
		canCreate(GAME_PLAYERS_B, USER_NORMAL, false);
	}));


	const testEndRecruitment = function(gamePlayers0: GamePlayers) {
		const self: User = USER_ADMIN;

		setUp(gamePlayers0, self, true);
		component.endRecruitment();
		tick();
		tick();
		fixture.detectChanges();

		assertInvariants();
		const html: HTMLElement = fixture.nativeElement;
		const recruitingElement: HTMLElement | null = html.querySelector('#recruiting');
		const endRecuitmentButton: HTMLButtonElement | null = html.querySelector('button#end-recruitment');

		const recruitingText: string = recruitingElement ? recruitingElement.innerText : '';
		expect(recruitingText.includes('This game is not recruiting players'))
			.withContext('recruiting element text indicates that not recruiting').toBeTrue();
		if (endRecuitmentButton) {
			expect(endRecuitmentButton.disabled).withContext('end-recuitment button is disabled').toBeTrue();
		}
	};

	it('can end recuitment [A]', fakeAsync((() => {
		testEndRecruitment(GAME_PLAYERS_A);
	})));

	it('can end recuitment [B]', fakeAsync((() => {
		testEndRecruitment(GAME_PLAYERS_B);
	})));

	const testJoinGame = function(gamePlayers0: GamePlayers, self: User) {
		setUp(gamePlayers0, self, true);
		component.joinGame();
		tick();
		fixture.detectChanges();

		assertInvariants();
		const gamePlayers1: GamePlayers | null = getGamePlayers(component);
		expect(gamePlayers1).withContext('gamePlayers').not.toBeNull();
		if (gamePlayers1) {
			expect(gamePlayers1.isPlaying(self.id)).withContext('gamePlayers.users includes self').toBeTrue();
		}
	};

	it('can join game [A]', fakeAsync((() => {
		testJoinGame(GAME_PLAYERS_A, USER_ADMIN);
	})));

	it('can join game [B]', fakeAsync((() => {
		testJoinGame(GAME_PLAYERS_B, USER_NORMAL);
	})));
});
