import { Observable, ReplaySubject, of } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { GameIdentifier } from '../game-identifier'
import { GamePlayers } from '../game-players'
import { GamePlayersService } from '../service/game-players.service';
import { GamePlayersComponent } from './game-players.component';
import { SelfService } from '../service/self.service';
import { User } from '../user';

class MockSelfService {

	constructor(private self: User) { };

	get id$(): Observable<string> {
		return of(this.self.id);
	}

	get username$(): Observable<string> {
		return of(this.self.username);
	}

	get mayManageGames$(): Observable<boolean> {
		return of(this.self.authorities.includes('ROLE_MANAGE_GAMES'));
	}
}

class MockGamePlayersService {

	private rs$: ReplaySubject<GamePlayers> = new ReplaySubject(1);
	private serverGamePlayers: GamePlayers;
	private identifier: GameIdentifier;

	constructor(
		gamePlayers: GamePlayers,
		private mayJoin: boolean,
		private self: string
	) {
		this.identifier = gamePlayers.identifier;
		this.rs$.next(gamePlayers);
		this.serverGamePlayers = gamePlayers;
	};

	private expectGameIdentifier(game: GameIdentifier, method: string): void {
		expect(game).withContext('GamePlayersService.' + method + '(game)').toEqual(this.identifier);
	}

	private copy(): Observable<GamePlayers> {
		return of({ identifier: this.serverGamePlayers.identifier, recruiting: this.serverGamePlayers.recruiting, users: this.serverGamePlayers.users });
	}

	getGamePlayers(game: GameIdentifier): Observable<GamePlayers> {
		this.expectGameIdentifier(game, 'getGamePlayers');
		return this.rs$.pipe(
			distinctUntilChanged()
		);
	}

	mayJoinGame(game: GameIdentifier): Observable<boolean> {
		this.expectGameIdentifier(game, 'mayJoinGame');
		return of(this.mayJoin);
	}

	endRecruitment(game: GameIdentifier): Observable<GamePlayers> {
		this.expectGameIdentifier(game, 'endRecuitment');
		this.serverGamePlayers.recruiting = false;
		return this.copy();
	}

	updateGamePlayers(game: GameIdentifier): void {
		this.expectGameIdentifier(game, 'updateGamePlayers');
		this.rs$.next(this.serverGamePlayers);
	}

	joinGame(game: GameIdentifier): Observable<GamePlayers> {
		this.expectGameIdentifier(game, 'joinGame');
		if (!this.serverGamePlayers.users.includes(this.self)) {
			this.serverGamePlayers.users.push(this.self);
		}
		return this.copy();
	}
}


describe('GamePlayersComponent', () => {
	let component: GamePlayersComponent;
	let fixture: ComponentFixture<GamePlayersComponent>;
	let gamePlayersServiceSpy: MockGamePlayersService;

	const SCENARIO_ID_A: string = uuid();
	const SCENARIO_ID_B: string = uuid();
	const CREATED_A: string = '1970-01-01T00:00:00.000Z';
	const CREATED_B: string = '2020-12-31T23:59:59.999Z';
	const USER_ID_A: string = uuid();
	const USER_ID_B: string = uuid();
	const USER_ADMIN: User = { id: uuid(), username: 'Allan', password: null, authorities: ['ROLE_MANAGE_GAMES'] };
	const USER_NORMAL: User = { id: uuid(), username: 'Benedict', password: null, authorities: [] };
	const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_ID_A, created: CREATED_A };
	const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_ID_B, created: CREATED_B };
	const GAME_PLAYERS_A: GamePlayers = { identifier: GAME_IDENTIFIER_A, recruiting: true, users: [USER_ID_A, USER_ID_B] };
	const GAME_PLAYERS_B: GamePlayers = { identifier: GAME_IDENTIFIER_B, recruiting: false, users: [] };

	const getIdentifier = function(component: GamePlayersComponent): GameIdentifier | null {
		var identifier: GameIdentifier | null = null;
		component.identifier$.subscribe({
			next: (i) => identifier = i,
			error: (err) => fail(err),
			complete: () => { }
		});
		return identifier;
	};

	const getGamePlayers = function(component: GamePlayersComponent): GamePlayers | null {
		var gamePlayers: GamePlayers | null = null;
		component.gamePlayers$.subscribe({
			next: (gps) => gamePlayers = gps,
			error: (err) => fail(err),
			complete: () => { }
		});
		return gamePlayers;
	};

	const isPlaying = function(component: GamePlayersComponent): boolean | null {
		var playing: boolean | null = null;
		component.playing$.subscribe({
			next: (p) => playing = p,
			error: (err) => fail(err),
			complete: () => { }
		});
		return playing;
	};



	const setUp = function(gamePlayers: GamePlayers, self: User, mayJoinGame: boolean) {
		const identifier: GameIdentifier = gamePlayers.identifier;
		gamePlayersServiceSpy = new MockGamePlayersService(gamePlayers, mayJoinGame, self.id);

		TestBed.configureTestingModule({
			declarations: [GamePlayersComponent],
			providers: [{
				provide: ActivatedRoute,
				useValue: {
					parent: {
						parent: {
							paramMap: of(convertToParamMap({ scenario: identifier.scenario }))
						},
						paramMap: of(convertToParamMap({ created: identifier.created }))
					},
					snapshot: {
						parent: {
							parent: {
								paramMap: convertToParamMap({ scenario: identifier.scenario })
							},
							paramMap: convertToParamMap({ created: identifier.created })
						}
					}
				}
			},
			{ provide: GamePlayersService, useValue: gamePlayersServiceSpy },
			{ provide: SelfService, useFactory: () => { return new MockSelfService(self); } }]
		});

		fixture = TestBed.createComponent(GamePlayersComponent);
		component = fixture.componentInstance;
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

		const joinableText: string = joinableElement ? joinableElement.innerText : "";

		expect(recruitingElement).withContext("recruiting element").not.toBeNull();
		expect(joinableElement).withContext("joinable element").not.toBeNull();
		expect(playersElement).withContext("players element").not.toBeNull();
		expect(playingElement).withContext("playing element").not.toBeNull();
		expect(endRecuitmentButton).withContext('end-recuitment button').not.toBeNull();
		expect(joinButton).withContext('join button').not.toBeNull();

		expect(joinableText.includes('You may not join this game') || joinableText.includes('You may join this game')).withContext("joinable element text reports a recognized message").toBeTrue();

		if (recruitingElement) {
			expect(recruitingElement.innerText).withContext("recruiting element text mentions recruiting").toMatch('[Rr]ecruiting');
		}
		if (joinableElement) {
			expect(joinableElement.innerText).withContext("joinable element text mentions joining").toMatch('[Jj]oin');
		}
		if (joinButton && joinableElement) {
			expect(joinButton.disabled == joinableText.includes('You may not join this game')).withContext('whether join button is disabled is consistent with joinable text').toBeTrue();
		}
	};


	const canCreate = function(gamePlayers: GamePlayers, self: User, mayJoinGame: boolean) {
		const recruiting: boolean = gamePlayers.recruiting;
		const manager: boolean = self.authorities.includes('ROLE_MANAGE_GAMES');
		const mayEndRecuitment: boolean = recruiting && manager;
		const playing: boolean = gamePlayers.users.includes(self.id);

		setUp(gamePlayers, self, mayJoinGame);
		tick();
		fixture.detectChanges();

		assertInvariants();

		expect(getIdentifier(component)).withContext('identifier$').toEqual(gamePlayers.identifier);
		expect(getGamePlayers(component)).withContext('gamePlayers$').toEqual(gamePlayers);
		expect(isPlaying(component)).withContext('playing').toEqual(playing);

		component.isEndRecruitmentDisabled$().subscribe(may => {
			expect(may).withContext('end recuitment disabled if game is not recuiting or user is not authorised').toEqual(!mayEndRecuitment);
		});

		component.mayJoinGame$().subscribe(may => {
			expect(may).withContext('mayJoinGame').toEqual(mayJoinGame);
		});

		const html: HTMLElement = fixture.nativeElement;
		const recruitingElement: HTMLElement | null = html.querySelector('#recruiting');
		const joinableElement: HTMLElement | null = html.querySelector('#joinable');
		const playingElement: HTMLElement | null = html.querySelector('#playing');
		const endRecuitmentButton: HTMLButtonElement | null = html.querySelector('button#end-recruitment');
		const joinButton: HTMLButtonElement | null = html.querySelector('button#join');

		const recruitingText: string = recruitingElement ? recruitingElement.innerText : "";
		const joinableText: string = joinableElement ? joinableElement.innerText : "";
		const playingText: string = playingElement ? playingElement.innerText : "";

		expect(recruiting || recruitingText.includes('This game is not recruiting players')).withContext("recruiting element text can indicate that not recruiting").toBeTrue();
		expect(!recruiting || recruitingText.includes('This game is recruiting players')).withContext("recruiting element text can indicate that is recruiting").toBeTrue();
		expect(mayJoinGame || joinableText.includes('You may not join this game')).withContext("joinable element text can indicate that not joinable").toBeTrue();
		expect(!mayJoinGame || joinableText.includes('You may join this game')).withContext("joinable element text can indicate that is joinable").toBeTrue();
		expect(playing || playingText.includes('You are not playing this game')).withContext("playing element text can indicate that not playing").toBeTrue();
		expect(!playing || playingText.includes('You are playing this game')).withContext("playing element text can indicate that playing").toBeTrue();
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

		const recruitingText: string = recruitingElement ? recruitingElement.innerText : "";
		expect(recruitingText.includes('This game is not recruiting players')).withContext("recruiting element text indicates that not recruiting").toBeTrue();
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
			expect(gamePlayers1.users.includes(self.id)).withContext('gamePlayers.users includes self').toBeTrue();
		}
	};

	it('can join game [A]', fakeAsync((() => {
		testJoinGame(GAME_PLAYERS_A, USER_ADMIN);
	})));

	it('can join game [B]', fakeAsync((() => {
		testJoinGame(GAME_PLAYERS_B, USER_NORMAL);
	})));
});
