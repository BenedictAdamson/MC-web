import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { Game } from '../game'
import { GameIdentifier } from '../game-identifier'
import { GameService } from '../service/game.service';
import { GameComponent } from './game.component';


describe('GameComponent', () => {
	let component: GameComponent;
	let fixture: ComponentFixture<GameComponent>;

	const SCENARIO_ID_A: string = uuid();
	const SCENARIO_ID_B: string = uuid();
	const CREATED_A: string = '1970-01-01T00:00:00.000Z';
	const CREATED_B: string = '2020-12-31T23:59:59.999Z';
	const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_ID_A, created: CREATED_A };
	const GAME_IDENTIFIER_B: GameIdentifier = { scenario: SCENARIO_ID_B, created: CREATED_B };
	const GAME_A: Game = { identifier: GAME_IDENTIFIER_A };
	const GAME_B: Game = { identifier: GAME_IDENTIFIER_B };


	const setUpForNgInit = function(game: Game) {
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


	const assertInvariants = function() {
		expect(component).toBeTruthy();

		const html: HTMLElement = fixture.nativeElement;
		const selfLink: HTMLAnchorElement | null = html.querySelector('a#game');

		expect(selfLink).withContext("self link").not.toBeNull();
	};


	const canCreate = function(game: Game) {
		setUpForNgInit(game);
		tick();
		fixture.detectChanges();

		assertInvariants();

		expect(component.game).withContext('game').toBe(game);

		const html: HTMLElement = fixture.nativeElement;
		const displayText: string = html.innerText;

		expect(displayText.includes(game.identifier.created)).withContext("The game page includes the date and time that the game was set up").toBeTrue();
	};

	it('can create [A]', fakeAsync(() => {
		canCreate(GAME_A);
	}));

	it('can create [B]', fakeAsync(() => {
		canCreate(GAME_B);
	}));

});
