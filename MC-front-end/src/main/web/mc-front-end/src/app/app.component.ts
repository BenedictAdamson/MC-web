import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { Component } from '@angular/core';

import { AbstractSelfService } from './service/abstract.self.service';
import { GameIdentifier } from './game-identifier';
import { GamePlayersService } from './service/game-players.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {

	/**
	 * {@linkplain SelfService.checkForCurrentAuthentication Checks the server for current authentication information}.
	 * That is, if the authentication system maintains sessions, and there is a current session,
	 * the constructor will resume the current session.
	 * This provides a better UX if the user refreshes their browser window,
	 * because they will not then have to login again.
	 */
	constructor(
		private readonly selfService: AbstractSelfService,
		private readonly gamePlayersService: GamePlayersService
	) {
		this.checkForCurrentAuthentication();
	}

	private checkForCurrentAuthentication(): void {
		this.selfService.checkForCurrentAuthentication().subscribe();
	}


	get mayListUsers$(): Observable<boolean> {
		return this.selfService.mayListUsers$;
	}

	get currentGameId$(): Observable<GameIdentifier|null> {
		return this.gamePlayersService.getCurrentGameId();
	}

	get currentGameScenario$(): Observable<string> {
		return this.currentGameId$.pipe(
			filter(id => !!id),
			map(id => id as GameIdentifier),
			map(id => id.scenario)
		);
	}

	get currentGameCreated$(): Observable<string> {
		return this.currentGameId$.pipe(
			filter(id => !!id),
			map(id => id as GameIdentifier),
			map(id => id.created)
		);
	}
}
