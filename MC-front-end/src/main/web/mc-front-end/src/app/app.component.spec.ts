import { v4 as uuid } from 'uuid';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AbstractGamePlayersBackEndService } from './service/abstract.game-players.back-end.service';
import { AbstractSelfService } from './service/abstract.self.service';
import { AppComponent } from './app.component';
import { GameIdentifier } from './game-identifier';
import { GamePlayers } from './game-players';
import { GamePlayersService } from './service/game-players.service';
import { HomeComponent } from './home/home.component';
import { MockSelfService } from './service/mock/mock.self.service';
import { SelfComponent } from './self/self.component';
import { User } from './user';

import { MockGamePlayersBackEndService } from './service/mock/mock.game-players.back-end.service';


describe('AppComponent', () => {

	const SCENARIO_ID_A: string = uuid();
	const CREATED_A = '1970-01-01T00:00:00.000Z';
	const GAME_IDENTIFIER_A: GameIdentifier = { scenario: SCENARIO_ID_A, created: CREATED_A };

	let component: AppComponent;
	let fixture: ComponentFixture<AppComponent>;
	let selfService: AbstractSelfService;

	const setUp = (authorities: string[], currentGame: GameIdentifier | null) => {
		const self: User = { id: uuid(), username: 'Benedict', password: null, authorities };
		const gamePlayers: GamePlayers | null = currentGame ? new GamePlayers(currentGame, true, new Map([[uuid(), self.id]])) : null;
		selfService = new MockSelfService(self);
		const gamePlayersBackEndService: AbstractGamePlayersBackEndService = new MockGamePlayersBackEndService(gamePlayers, self.id);
		const gamePlayersService: GamePlayersService = new GamePlayersService(gamePlayersBackEndService);
		TestBed.configureTestingModule({
			declarations: [
				AppComponent, SelfComponent
			],
			imports: [
				RouterTestingModule.withRoutes(
					[{ path: '', component: HomeComponent }]
				)
			],
			providers: [
				{ provide: GamePlayersService, useValue: gamePlayersService },
				{ provide: AbstractSelfService, useValue: selfService }
			]
		});

		fixture = TestBed.createComponent(AppComponent);
		component = fixture.componentInstance;
	};

	const testSetUp = (authorities: string[], expectMayListUsers: boolean, currentGame: GameIdentifier | null) => {
		setUp(authorities, currentGame);
		fixture.detectChanges();

		const html: HTMLElement = fixture.debugElement.nativeElement;
		const currentGameLink: HTMLAnchorElement | null = html.querySelector('a[id="current-game"]');
		const scenariosLink: HTMLAnchorElement | null = html.querySelector('a[id="scenarios"]');
		const usersLink: HTMLAnchorElement | null = html.querySelector('a[id="users"]');
		const header: HTMLElement | null = html.querySelector('h1');

		const headerText: string | null = header ? header.textContent : null;
		const scenariosLinkText: string | null = scenariosLink ? scenariosLink.textContent : null;

		expect(component).toBeTruthy();

		expect(headerText).withContext('h1 text').toContain('Mission Command');
		expect(scenariosLink).withContext('scenarios link element').not.toBeNull();
		expect(scenariosLinkText).withContext('scenarios link text').toContain('Scenarios');

		expect(usersLink != null).withContext('has users link element').toBe(expectMayListUsers);
		if (usersLink != null) {
			expect(usersLink.textContent).withContext('users link text').toContain('Users');
		}
		expect(currentGameLink != null).withContext('has current-game link element').toBe(currentGame !== null);
		if (currentGameLink != null) {
			expect(currentGameLink.textContent).withContext('current-game link text').toContain('Current game');
		}
	};

	it('can be constructed [no roles, not playing]', () => {
		testSetUp([], false, null);
	});

	it('can be constructed [player, not playing]', () => {
		testSetUp(['ROLE_PLAYER'], true, null);
	});

	it('can be constructed [player, playing]', () => {
		testSetUp(['ROLE_PLAYER'], true, GAME_IDENTIFIER_A);
	});
});
