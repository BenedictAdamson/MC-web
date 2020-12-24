import { Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { GameIdentifier } from '../game-identifier'
import { GamePlayers } from '../game-players'


export abstract class AbstractGamePlayersService {

	private static createKey(game: GameIdentifier): string {
		return game.scenario + '@' + game.created;
	}



	private gamesPlayers: Map<string, ReplaySubject<GamePlayers | null>> = new Map();
	private mayJoin: Map<string, ReplaySubject<boolean>> = new Map();

	constructor() { }



	private createCacheForGamePlayers(game: GameIdentifier): ReplaySubject<GamePlayers> {
		const rs: ReplaySubject<GamePlayers> = new ReplaySubject<GamePlayers>(1);
		this.gamesPlayers.set(AbstractGamePlayersService.createKey(game), rs);
		return rs;
	}

	private updateCachedGamePlayers(game: GameIdentifier, rs: ReplaySubject<GamePlayers | null>): void {
		this.fetchGamePlayers(game).subscribe(gamePlayers => rs.next(gamePlayers));
	}


	private createCacheForMayJoin(game: GameIdentifier): ReplaySubject<boolean> {
		const rs: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
		this.mayJoin.set(AbstractGamePlayersService.createKey(game), rs);
		return rs;
	}

	private updateCachedMayJoin(game: GameIdentifier, rs: ReplaySubject<boolean>): void {
		this.fetchMayJoin(game).subscribe(may => rs.next(may));
	}

	/**
	 * Get the players of the game that has a given ID.
	 *
	 * The service might have to request the server for this information.
	 * However, it caches responses, so the value emitted by the returned [[Observable]]
	 * could be an immediately available cached value that does not require contacting the server.
	 *
	 * The  [[Observable]] returned by this method does not normally immediately end
	 * once it has emitted one value. It will emit additional values
	 * (after the first) as updated values if it has been asked to [[updateGamePlayers]].
	 *
	 * The  [[Observable]] returned by this method emits only distinct values.
	 */
	getGamePlayers(game: GameIdentifier): Observable<GamePlayers | null> {
		var rs: ReplaySubject<GamePlayers | null> | undefined = this.gamesPlayers.get(AbstractGamePlayersService.createKey(game));
		if (!rs) {
			rs = this.createCacheForGamePlayers(game);
			this.updateCachedGamePlayers(game, rs);
		}
		return rs.pipe(
			distinctUntilChanged()
		);
	}

	private setGamePlayers(game: GameIdentifier, gamePlayers: GamePlayers | null): void {
		if (gamePlayers) game = gamePlayers.game;
		var rs: ReplaySubject<GamePlayers | null> | undefined = this.gamesPlayers.get(AbstractGamePlayersService.createKey(game));
		if (!rs) {
			rs = this.createCacheForGamePlayers(game);
		}
		rs.next(gamePlayers);
	}

	/**
	 * Ask the service to update its cached value for the players of a game.
	 *
	 * The method does not block, but instead performs the update asynchronously.
	 * The updated value will eventually become available through the [[Observable]]
	 * returned by [[getGamePlayers]].
	 */
	updateGamePlayers(game: GameIdentifier): void {
		var rs: ReplaySubject<GamePlayers | null> | undefined = this.gamesPlayers.get(AbstractGamePlayersService.createKey(game));
		if (!rs) {
			rs = this.createCacheForGamePlayers(game);
		}
		this.updateCachedGamePlayers(game, rs);
	}

	/**
	 * Ask the service to update its cached value for whether the current user may join the game that has a given ID.
	 *
	 * The method does not block, but instead performs the update asynchronously.
	 * The updated value will eventually become available through the [[Observable]]
	 * returned by [[mayJoinGame]].
	 */
	updateMayJoinGame(game: GameIdentifier): void {
		var rs: ReplaySubject<boolean> | undefined = this.mayJoin.get(AbstractGamePlayersService.createKey(game));
		if (!rs) {
			rs = this.createCacheForMayJoin(game);
		}
		this.updateCachedMayJoin(game, rs);
	}

	/**
	 * Ask that the current user joins the game that has a given ID.
	 *
	 * Calling this method starts an asynchronous operation to cause the change on the server,
	 * which will result in the [[Observable]] returned by [[getGamePlayers(GameIdentifier)]]
	 * emitting an updated value for the game players of the given `game`,
	 * if server value has changed.
	 *
	 * The operation performs a POST.
	 * The server actually replies to the POST with a 302 (Found) redirect
	 * to the resource of the altered game players resource.
	 * The HttpClient or browser itself handles that redirect for us.
	 *
	 * @param game
	 * The unique ID of the game to join.
	 */
	joinGame(game: GameIdentifier): void {
		this.requestJoinGame(game).subscribe(
			gps => this.setGamePlayers(game, gps)
		);
	}


	/**
	 * Change a game so it is no longer [[Game.recruiting|recruiting]] players.
	 *
	 * Calling this method starts an asynchronous operation to cause the change on the server,
	 * which will result in the [[Observable]] returned by [[getGamePlayers(GameIdentifier)]]
	 * emitting an updated value for the game players of the given `game`,
	 * if server value has changed.
	 *
	 * The operation performs a POST.
	 * The server actually replies to the POST with a 302 (Found) redirect
	 * to the resource of the altered game players resource.
	 * The HttpClient or browser itself handles that redirect for us.
	 *
	 * @param game
	 * The unique ID of the game for which to end recuitment.
	 */
	endRecruitment(game: GameIdentifier): void {
		this.requestEndRecruitment(game).subscribe(
			gps => this.setGamePlayers(game, gps)
		);
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
		var rs: ReplaySubject<boolean> | undefined = this.mayJoin.get(AbstractGamePlayersService.createKey(game));
		if (!rs) {
			rs = this.createCacheForMayJoin(game);
			this.updateCachedMayJoin(game, rs);
		}
		return rs.pipe(
			distinctUntilChanged()
		);
	}



	protected abstract fetchGamePlayers(game: GameIdentifier): Observable<GamePlayers | null>;

	protected abstract fetchMayJoin(game: GameIdentifier): Observable<boolean>;

	protected abstract requestJoinGame(game: GameIdentifier): Observable<GamePlayers>;

	protected abstract requestEndRecruitment(game: GameIdentifier): Observable<GamePlayers>;
}
