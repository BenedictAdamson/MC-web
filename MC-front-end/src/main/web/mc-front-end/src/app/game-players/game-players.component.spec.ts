import { Observable, of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { Game } from '../game'
import { GameIdentifier } from '../game-identifier'
import { GameService } from '../game.service';
import { GamePlayersComponent } from './game-players.component';
import { SelfService } from '../self.service';
import { User } from '../user';

class MockSelfService {

	constructor(private self: User) { };

	get username(): string {
		return this.self.username;
	}

	get mayManageGames$(): Observable<boolean> {
		return of(this.self.authorities.includes('ROLE_MANAGE_GAMES'));
	}
}


describe('GamePlayersComponent', () => {
	let component: GamePlayersComponent;
	let fixture: ComponentFixture<GamePlayersComponent>;

	const SCENARIO_ID_A: uuid = uuid();
	const SCENARIO_ID_B: uuid = uuid();
	const CREATED_A: string = '1970-01-01T00:00:00.000Z';
	const CREATED_B: string = '2020-12-31T23:59:59.999Z';
	const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_ID_A, created: CREATED_A };
	const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_ID_B, created: CREATED_B };
	const GAME_A: Game = { identifier: GAME_IDENTIFIER_A, recruiting: true };
	const GAME_B: Game = { identifier: GAME_IDENTIFIER_B, recruiting: false };

	const USER_ADMIN = { id: new uuid(), username: 'Allan', password: null, authorities: ['ROLE_MANAGE_GAMES'] };
	const USER_NORMAL = { id: new uuid(), username: 'Benedict', password: null, authorities: [] };



	const setUpForNgInit = function(game: Game, self: User) {
		const gameServiceStub = jasmine.createSpyObj('GameService', ['getGame']);
		gameServiceStub.getGame.and.returnValue(of(game));

		const identifier: GameIdentifier = game.identifier;
		TestBed.configureTestingModule({
			declarations: [GamePlayersComponent],
			providers: [{
				provide: ActivatedRoute,
				useValue: {
					params: of({ scenario: identifier.scenario, created: identifier.created }),
					snapshot: {
						parent: {
							paramMap: convertToParamMap({ scenario: identifier.scenario })
						},
						paramMap: convertToParamMap({ created: identifier.created })
					}
				}
			},
			{ provide: GameService, useValue: gameServiceStub },
			{ provide: SelfService, useFactory: () => { return new MockSelfService(self); } }]
		});

		fixture = TestBed.createComponent(GamePlayersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};


	const assertInvariants = function() {
		expect(component).toBeTruthy();

		const html: HTMLElement = fixture.nativeElement;
		const recruitingElement: HTMLElement = html.querySelector('#recruiting');
		const endRecuitmentButton: HTMLButtonElement = html.querySelector('button#end-recruitment');

		expect(recruitingElement).withContext("recruiting element").not.toBeNull();
		expect(recruitingElement.innerText).withContext("recruiting element text mentions recruiting").toMatch('[Rr]ecruiting');
		expect(endRecuitmentButton).withContext('end-recuitment button').not.toBeNull();
	};


	const canCreate = function(game: Game, self: User) {
		const recruiting: boolean = game.recruiting;
		const manager: boolean = self.authorities.includes('ROLE_MANAGE_GAMES');
		const mayEndRecuitment: boolean = recruiting && manager;

		setUpForNgInit(game, self);
		tick();
		fixture.detectChanges();

		assertInvariants();

		expect(component.game).withContext('game').toBe(game);

		component.isEndRecruitmentDisabled$().subscribe(may => {
			expect(may).withContext('end recuitment disabled if game is not recuiting or user is not authorised').toEqual(!mayEndRecuitment);
		});

		const html: HTMLElement = fixture.nativeElement;
		const recruitingElement: HTMLElement = html.querySelector('#recruiting');
		const endRecuitmentButton: HTMLButtonElement = html.querySelector('button#end-recruitment');

		const recruitingText: string = recruitingElement.innerText;
		expect(recruiting || recruitingText.includes('This game is not recruiting players')).withContext("recruiting element text can indicate that not recruiting").toBeTrue();
		expect(!recruiting || recruitingText.includes('This game is recruiting players')).withContext("recruiting element text can indicate that is recruiting").toBeTrue();
		expect(endRecuitmentButton.disabled).withContext('end-recuitment button is disabled').toEqual(!mayEndRecuitment);
	};

	it('can create [A]', fakeAsync(() => {
		canCreate(GAME_A, USER_ADMIN);
	}));

	it('can create [B]', fakeAsync(() => {
		canCreate(GAME_A, USER_NORMAL);
	}));

	it('can create [C]', fakeAsync(() => {
		canCreate(GAME_B, USER_ADMIN);
	}));

	it('can create [D]', fakeAsync(() => {
		canCreate(GAME_B, USER_NORMAL);
	}));

	const setUpForEndRecuitment = function(game0: Game, self: User) {
		const identifier: GameIdentifier = game0.identifier;
		const game1: Game = { identifier: identifier, recruiting: false };

		const gameServiceStub = jasmine.createSpyObj('GameService', ['getGame', 'endRecuitment']);
		gameServiceStub.getGame.and.returnValue(of(game0));
		gameServiceStub.endRecuitment.and.returnValue(of(game1));

		TestBed.configureTestingModule({
			declarations: [GamePlayersComponent],
			providers: [{
				provide: ActivatedRoute,
				useValue: {
					params: of({ scenario: identifier.scenario, created: identifier.created }),
					snapshot: {
						parent: {
							paramMap: convertToParamMap({ scenario: identifier.scenario })
						},
						paramMap: convertToParamMap({ created: identifier.created })
					}
				}
			},
			{ provide: GameService, useValue: gameServiceStub },
			{ provide: SelfService, useFactory: () => { return new MockSelfService(self); } }]
		});

		fixture = TestBed.createComponent(GamePlayersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};


	const testEndRecuitment = function(game: Game) {
		const self: User = USER_ADMIN;

		setUpForEndRecuitment(game, self);
		component.endRecuitment();
		tick();
		fixture.detectChanges();

		assertInvariants();
		const html: HTMLElement = fixture.nativeElement;
		const recruitingElement: HTMLElement = html.querySelector('#recruiting');
		const endRecuitmentButton: HTMLButtonElement = html.querySelector('button#end-recruitment');

		const recruitingText: string = recruitingElement.innerText;
		expect(recruitingText.includes('This game is not recruiting players')).withContext("recruiting element text indicates that not recruiting").toBeTrue();
		expect(endRecuitmentButton.disabled).withContext('end-recuitment button is disabled').toBeTrue();
	};

	it('can end recuitment [A]', fakeAsync((() => {
		testEndRecuitment(GAME_A);
	})));

	it('can end recuitment [B]', fakeAsync((() => {
		testEndRecuitment(GAME_B);
	})));
});
