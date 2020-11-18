import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Game } from '../game'
import { GameIdentifier } from '../game-identifier'
import { GameService } from '../game.service';

import { GameComponent } from './game.component';


describe('GameComponent', () => {
	let component: GameComponent;
	let fixture: ComponentFixture<GameComponent>;

	const SCENARIO_ID_A: uuid = uuid();
	const SCENARIO_ID_B: uuid = uuid();
	const CREATED_A: string = '1970-01-01T00:00:00.000Z';
	const CREATED_B: string = '2020-12-31T23:59:59.999Z';
	const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_ID_A, created: CREATED_A };
	const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_ID_B, created: CREATED_B };
	const GAME_A: Game = { identifier: GAME_IDENTIFIER_A, recruiting: true };
	const GAME_B: Game = { identifier: GAME_IDENTIFIER_B, recruiting: false };



	const setUp = function(game: Game) {
		const gameServiceStub = jasmine.createSpyObj('GameService', ['getGame']);
		gameServiceStub.getGame.and.returnValue(of(game));

		const identifier: GameIdentifier = game.identifier;
		TestBed.configureTestingModule({
			declarations: [GameComponent],
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
			{ provide: GameService, useValue: gameServiceStub }]
		});

		fixture = TestBed.createComponent(GameComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};


	const canCreate = function(game: Game) {
		const recruiting: boolean = game.recruiting;

		setUp(game);

		expect(component).toBeTruthy();
		expect(component.game).withContext('game').toBe(game);

		const html: HTMLElement = fixture.nativeElement;
		const displayText: string = html.innerText;
		const selfLink: HTMLAnchorElement = html.querySelector('a#game');
		const recruitingElement: HTMLElement = html.querySelector('#recruiting');

		expect(displayText.includes(game.identifier.created)).withContext("The game page includes the date and time that the game was set up").toBeTrue();
		expect(selfLink).withContext("self link").not.toBeNull();
		expect(recruitingElement).withContext("recruiting element").not.toBeNull();
		const recruitingText: string = recruitingElement.innerText;
		expect(recruitingText).withContext("recruiting element text mentions recruiting").toMatch('[Rr]ecruiting');
		expect(recruiting || recruitingText.includes('This game is not recruiting players')).withContext("recruiting element text can indicate that not recruiting").toBeTrue();
		expect(!recruiting || recruitingText.includes('This game is recruiting players')).withContext("recruiting element text can indicate that is recruiting").toBeTrue();
	};

	it('can create [A]', () => {
		canCreate(GAME_A);
	});

	it('can create [B]', () => {
		canCreate(GAME_B);
	});
});
