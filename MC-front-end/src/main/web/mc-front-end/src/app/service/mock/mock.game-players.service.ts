import { Observable, of } from 'rxjs';

import { AbstractGamePlayersService } from '../abstract.game-players.service'
import { GameIdentifier } from '../../game-identifier'
import { GamePlayers } from '../../game-players'

export class MockGamePlayersService extends AbstractGamePlayersService {

	private serverGamePlayers: GamePlayers;
	private game: GameIdentifier;

	constructor(
		gamePlayersServer: GamePlayers,
		private mayJoinServer: boolean,
		private self: string
	) {
		super();
		this.game = gamePlayersServer.game;
		this.serverGamePlayers = gamePlayersServer;
	};

	private expectGameIdentifier(game: GameIdentifier, method: string): void {
		expect(game).withContext('MockGamePlayersService.' + method + '(game)').toEqual(this.game);
	}

	private copy(): Observable<GamePlayers> {
		return of({ game: this.serverGamePlayers.game, recruiting: this.serverGamePlayers.recruiting, users: this.serverGamePlayers.users });
	}


	protected fetchGamePlayers(game: GameIdentifier): Observable<GamePlayers | null> {
		this.expectGameIdentifier(game, 'getGamePlayers');
		return of(this.serverGamePlayers);
	}

	protected fetchMayJoin(game: GameIdentifier): Observable<boolean> {
		this.expectGameIdentifier(game, 'mayJoinGame');
		return of(this.mayJoinServer);
	}

	protected requestJoinGame(game: GameIdentifier): Observable<GamePlayers> {
		this.expectGameIdentifier(game, 'joinGame');
		if (!this.serverGamePlayers.users.includes(this.self)) {
			this.serverGamePlayers.users.push(this.self);
		}
		return this.copy();
	}

	protected requestEndRecruitment(game: GameIdentifier): Observable<GamePlayers> {
		this.expectGameIdentifier(game, 'endRecuitment');
		this.serverGamePlayers.recruiting = false;
		return this.copy();
	}
}
