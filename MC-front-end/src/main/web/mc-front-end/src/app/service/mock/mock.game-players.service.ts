import { Observable, ReplaySubject, of } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { GameIdentifier } from '../../game-identifier'
import { GamePlayers } from '../../game-players'

export class MockGamePlayersService {

	private rs$: ReplaySubject<GamePlayers> = new ReplaySubject(1);
	private serverGamePlayers: GamePlayers;
	private game: GameIdentifier;

	constructor(
		gamePlayers: GamePlayers,
		private mayJoin: boolean,
		private self: string
	) {
		this.game = gamePlayers.game;
		this.rs$.next(gamePlayers);
		this.serverGamePlayers = gamePlayers;
	};

	private expectGameIdentifier(game: GameIdentifier, method: string): void {
		expect(game).withContext('GamePlayersService.' + method + '(game)').toEqual(this.game);
	}

	private copy(): Observable<GamePlayers> {
		return of({ game: this.serverGamePlayers.game, recruiting: this.serverGamePlayers.recruiting, users: this.serverGamePlayers.users });
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
