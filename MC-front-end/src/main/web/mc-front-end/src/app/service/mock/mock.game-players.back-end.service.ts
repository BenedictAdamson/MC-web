import { Observable, of, throwError } from 'rxjs';

import { AbstractGamePlayersBackEndService } from '../abstract.game-players.back-end.service';
import { GameIdentifier } from '../../game-identifier';
import { Game } from '../../game';

export class MockGamePlayersBackEndService extends AbstractGamePlayersBackEndService {

	private game: Game | null;
	private readonly identifier: GameIdentifier | null;

	constructor(
		game: Game | null,
		private self: string
	) {
		super();
		this.identifier = game ? game.identifier : null;
		this.game = game;
	};


	get(game: GameIdentifier): Observable<Game | null> {
		this.expectGameIdentifier(game, 'getGamePlayers');
		return of(this.game);
	}

	joinGame(game: GameIdentifier): Observable<Game> {
		if (!this.game) {
			this.game = new Game(game, 'WAITING_TO_START', true, new Map());
		}
		if (!this.game.isPlaying(this.self)) {
			this.game.users.set('FIXME', this.self);
		}
		return this.copy();
	}

	endRecruitment(game: GameIdentifier): Observable<Game> {
		this.expectGameIdentifier(game, 'endRecruitment');
		if (this.game) {
			this.game.recruiting = false;
		}
		return this.copy();
	}

	getCurrentGameId(): Observable<GameIdentifier | null> {
		return of(this.identifier);
	}

	private expectGameIdentifier(game: GameIdentifier | null, method: string): void {
		expect(game).withContext('MockGamePlayersService.' + method + '(game)').toEqual(this.identifier);
	}

	private copy(): Observable<Game> {
		if (this.game) {
			return of(new Game(this.game.identifier, this.game.runState, this.game.recruiting, this.game.users));
		} else {
			return throwError('No current game');
		}
	}
}
