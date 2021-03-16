import { Observable, of, throwError } from 'rxjs';

import { AbstractGamePlayersBackEndService } from '../abstract.game-players.back-end.service';
import { GameIdentifier } from '../../game-identifier';
import { GamePlayers } from '../../game-players';

export class MockGamePlayersBackEndService extends AbstractGamePlayersBackEndService {

	private gamePlayers: GamePlayers | null;
	private game: GameIdentifier | null;

	constructor(
		gamePlayers: GamePlayers | null,
		private self: string
	) {
		super();
		this.game = gamePlayers ? gamePlayers.game : null;
		this.gamePlayers = gamePlayers;
	};


	get(game: GameIdentifier): Observable<GamePlayers | null> {
		this.expectGameIdentifier(game, 'getGamePlayers');
		return of(this.gamePlayers);
	}

	joinGame(game: GameIdentifier): Observable<GamePlayers> {
		if (!this.gamePlayers) {
			this.gamePlayers = new GamePlayers(game, true, new Map());
		}
		if (!this.gamePlayers.isPlaying(this.self)) {
			this.gamePlayers.users.set('FIXME', this.self);
		}
		return this.copy();
	}

	endRecruitment(game: GameIdentifier): Observable<GamePlayers> {
		this.expectGameIdentifier(game, 'endRecuitment');
		if (this.gamePlayers) {
			this.gamePlayers.recruiting = false;
		}
		return this.copy();
	}

	getCurrentGameId(): Observable<GameIdentifier | null> {
		return of(this.game);
	}

	private expectGameIdentifier(game: GameIdentifier | null, method: string): void {
		expect(game).withContext('MockGamePlayersService.' + method + '(game)').toEqual(this.game);
	}

	private copy(): Observable<GamePlayers> {
		if (this.gamePlayers) {
			return of(new GamePlayers(this.gamePlayers.game, this.gamePlayers.recruiting, this.gamePlayers.users));
		} else {
			return throwError('No current game');
		}
	}
}
