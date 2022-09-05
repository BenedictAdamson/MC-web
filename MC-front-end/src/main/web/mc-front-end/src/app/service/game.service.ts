import {Observable, ReplaySubject} from 'rxjs';

import {Injectable} from '@angular/core';

import {AbstractGameBackEndService} from './abstract.game.back-end.service';
import {CachingKeyValueService} from './caching.key-value.service';
import {Game} from '../game';
import {AbstractSelfService} from "./abstract.self.service";


@Injectable({
  providedIn: 'root'
})
export class GameService extends CachingKeyValueService<string, Game, string> {

  private currentId: ReplaySubject<string | null> | null = null;

  constructor(
    private readonly selfService: AbstractSelfService,
    private gameBackEndService: AbstractGameBackEndService
  ) {
    super(gameBackEndService);
    /* When the user ID changes, the current game changes. */
    this.selfService.id$.subscribe(() => {
      if (this.currentId) {
        this.updateCurrentGameId();
      }
    });
  }

  static getApiGamesOfScenarioPath(scenario: string): string {
    return '/api/scenario/' + scenario + '/games';
  }

  static getApiGamePath(id: string): string {
    return '/api/game/' + id;
  }
  static getApiJoinGamePath(game: string): string {
    return GameService.getApiGamePath(game) + '?join';
  }

  static getApiGameEndRecruitmentPath(game: string): string {
    return GameService.getApiGamePath(game) + '?endRecruitment';
  }

  /**
   * Create a new game for a given scenario.
   *
   * @param scenario
   * The unique ID of the scenario for which to create a gave.
   * @returns
   * An [[Observable]] that provides the created game.
   * The [[GameIdentifier.scenario]] of the [[Game.identifier]] of the created game
   * is equal to the given {@code scenario}.
   */
  createGame(scenario: string): Observable<Game> {
    /* The server actually replies to the POST with a 302 (Found) redirect to the resource of the created game.
     * The HttpClient or browser itself handles that redirect for us.
     */
    return this.add(scenario) as Observable<Game>;
  }

  startGame(game: string): void {
    this.gameBackEndService.startGame(game).subscribe(
      g => {
        this.setValue(g);
      }
    );
  }

  stopGame(game: string): void {
    this.gameBackEndService.stopGame(game).subscribe(
      g => {
        this.setValue(g);
      }
    );
  }

  getAll(): undefined {
    return undefined;
  }

  /**
   * Ask that the current user joins the game that has a given ID.
   *
   * Calling this method starts an asynchronous operation to cause the change on the server,
   * which will result in the [[Observable]] returned by [[get(GameIdentifier)]]
   * emitting an updated value for the game players of the given `game`,
   * if server value has changed.
   *
   * @param game
   * The unique ID of the game to join.
   */
  joinGame(game: string): void {
    this.gameBackEndService.joinGame(game).subscribe(
      gps => {
        this.setValue(gps);
        if (!this.currentId) {
          this.currentId = new ReplaySubject(1);
        }
        this.currentId.next(game);
      }
    );
  }

  getCurrentGameId(): Observable<string | null> {
    if (!this.currentId) {
      this.currentId = new ReplaySubject(1);
      this.updateCurrentGameIdRS(this.currentId);
    }
    // else use currently cached value
    return this.currentId.asObservable();
  }

  updateCurrentGameId(): void {
    if (!this.currentId) {
      this.currentId = new ReplaySubject(1);
    }
    this.updateCurrentGameIdRS(this.currentId);
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
  endRecruitment(game: string): void {
    this.gameBackEndService.endRecruitment(game).subscribe(
      gps => this.setValue(gps)
    );
  }

  protected createKeyString(id: string): string {
    return id;
  }

  protected getKey(value: Game): string {
    return value.identifier;
  }

  private updateCurrentGameIdRS(currentGameId: ReplaySubject<string | null>): void {
    this.gameBackEndService.getCurrentGameId().subscribe(
      g => currentGameId.next(g)
    );
  }
}
