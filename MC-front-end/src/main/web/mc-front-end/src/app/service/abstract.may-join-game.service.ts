import { Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { GameIdentifier } from '../game-identifier'
import { GamePlayers } from '../game-players'


export abstract class AbstractMayJoinGameService {

	private static createKey(game: GameIdentifier): string {
		return game.scenario + '@' + game.created;
	}



	private mayJoin: Map<string, ReplaySubject<boolean>> = new Map();

	constructor() { }



	private createCacheForMayJoin(game: GameIdentifier): ReplaySubject<boolean> {
		const rs: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
		this.mayJoin.set(AbstractMayJoinGameService.createKey(game), rs);
		return rs;
	}

	private updateCachedMayJoin(game: GameIdentifier, rs: ReplaySubject<boolean>): void {
		this.fetchMayJoin(game).subscribe(may => rs.next(may));
	}

	/**
	 * Ask the service to update its cached value for whether the current user may join the game that has a given ID.
	 *
	 * The method does not block, but instead performs the update asynchronously.
	 * The updated value will eventually become available through the [[Observable]]
	 * returned by [[mayJoinGame]].
	 */
	updateMayJoinGame(game: GameIdentifier): void {
		var rs: ReplaySubject<boolean> | undefined = this.mayJoin.get(AbstractMayJoinGameService.createKey(game));
		if (!rs) {
			rs = this.createCacheForMayJoin(game);
		}
		this.updateCachedMayJoin(game, rs);
	}

	/**
	 * Ask whether the current user may join the game that has a given ID.
	 *
	 * @param game
	 * The unique ID of the game to join.
	 * @returns
	 * An [[Observable]] that indicates whether may join.
	 */
	mayJoinGame(game: GameIdentifier): Observable<boolean> {
		var rs: ReplaySubject<boolean> | undefined = this.mayJoin.get(AbstractMayJoinGameService.createKey(game));
		if (!rs) {
			rs = this.createCacheForMayJoin(game);
			this.updateCachedMayJoin(game, rs);
		}
		return rs.pipe(
			distinctUntilChanged()
		);
	}



	protected abstract fetchMayJoin(game: GameIdentifier): Observable<boolean>;
}
