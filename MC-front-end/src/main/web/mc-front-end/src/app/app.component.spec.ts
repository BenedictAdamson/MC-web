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
      const currentGameSpan: HTMLElement | null = html.querySelector('span[id="current-game"]');
      const scenariosLink: HTMLAnchorElement | null = html.querySelector('a[id="scenarios"]');
      const usersLink: HTMLAnchorElement | null = html.querySelector('a[id="users"]');
      const usersSpan: HTMLElement | null = html.querySelector('span[id="users"]');
      const header: HTMLElement | null = html.querySelector('h1');

      const currentGameText: string | null = currentGameLink ? currentGameLink.textContent :
         (currentGameSpan ? currentGameSpan.textContent : null);
      const headerText: string | null = header ? header.textContent : null;
      const scenariosLinkText: string | null = scenariosLink ? scenariosLink.textContent : null;
      const usersText: string | null = usersLink ? usersLink.textContent :
         (usersSpan ? usersSpan.textContent : null);

      expect(component).toBeTruthy();

      expect(headerText).withContext('h1 text').toContain('Mission Command');
      expect(scenariosLink).withContext('scenarios link element').not.toBeNull();
      expect(scenariosLinkText).withContext('scenarios link text').toContain('Scenarios');

      expect((usersLink != null) !== (usersSpan != null))
         .withContext('has either users link or span, but not both').toBeTrue();
      expect(usersLink != null).withContext('has users link element').toBe(expectMayListUsers);
      expect(usersText).withContext('users text').toContain('Users');

      expect((currentGameLink != null) !== (currentGameSpan != null))
         .withContext('has either current-game link or span, but not both').toBeTrue();
      expect(currentGameLink != null).withContext('has current-game link element').toBe(currentGame !== null);
      expect(currentGameText).withContext('current-game text').toContain('urrent game');
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
