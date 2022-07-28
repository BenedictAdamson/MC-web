import {Observable, of} from 'rxjs';

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {AbstractGameBackEndService} from './abstract.game.back-end.service';
import {Game} from '../game';
import {GameIdentifier} from '../game-identifier';
import {catchError, map} from "rxjs/operators";
import {HttpKeyValueService} from "./http.key-value.service";


const apiScenariosPath = '/api/scenario/';

export class EncodedGame {
  identifier: GameIdentifier;
  runState: string;
  recruiting: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  users: object;
}

export const CURRENTGAMEPATH = '/api/self/current-game';


class Delegate extends HttpKeyValueService<GameIdentifier, Game, EncodedGame, string, void> {

  constructor(
    http: HttpClient
  ) {
    super(http, undefined);
  }


  getUrl(id: GameIdentifier): string {
    return HttpGameBackEndService.getApiGamePath(id);
  }

  getAll(): undefined {
    return undefined;
  }

  startGame(id: GameIdentifier): Observable<Game> {
    return this.http.post<Game>(HttpGameBackEndService.getApiStartGamePath(id), '');
  }

  stopGame(id: GameIdentifier): Observable<Game> {
    return this.http.post<Game>(HttpGameBackEndService.getApiStopGamePath(id), '');
  }


  protected getAddUrl(scenario: string): string {
    return HttpGameBackEndService.getApiGamesPath(scenario);
  }

  protected getAddPayload(_scenario: string): null {
    return null;
  }

  joinGame(identifier: GameIdentifier): Observable<Game> {
    return this.http.post<Game>(HttpGameBackEndService.getApiJoinGamePath(identifier), '').pipe(
      map(v => this.decode(v))
    );
  }

  endRecruitment(identifier: GameIdentifier): Observable<Game> {
    return this.http.post<Game>(HttpGameBackEndService.getApiGameEndRecruitmentPath(identifier), '').pipe(
      map(v => this.decode(v))
    );
  }

  getCurrentGameId(): Observable<GameIdentifier | null> {
    return this.http.get<Game>(CURRENTGAMEPATH).pipe(
      catchError(() => of(null)),
      map(g => g ? g.identifier : null)
    );
  }

  protected decode(encodedValue: EncodedGame): Game {
    const users: Map<string, string> = new Map(Object.entries(encodedValue.users).map(([k, v]) => ([k, v])));
    return new Game(encodedValue.identifier, encodedValue.runState, encodedValue.recruiting, users);
  }

}// class


@Injectable({
  providedIn: 'root'
})
export class HttpGameBackEndService extends AbstractGameBackEndService {

  private delegate: Delegate;


  constructor(
    http: HttpClient
  ) {
    super();
    this.delegate = new Delegate(http);
  }

  static getApiGamesPath(scenario: string): string {
    return apiScenariosPath + scenario + '/game/';
  }

  static getApiGamePath(id: GameIdentifier): string {
    return HttpGameBackEndService.getApiGamesPath(id.scenario) + id.created;
  }

  static getApiStartGamePath(id: GameIdentifier): string {
    return HttpGameBackEndService.getApiGamePath(id) + '?start';
  }

  static getApiStopGamePath(id: GameIdentifier): string {
    return HttpGameBackEndService.getApiGamePath(id) + '?stop';
  }
  static getApiJoinGamePath(game: GameIdentifier): string {
    return HttpGameBackEndService.getApiGamePath(game) + '?join';
  }

  static getApiGameEndRecruitmentPath(game: GameIdentifier): string {
    return HttpGameBackEndService.getApiGamePath(game) + '?endRecruitment';
  }


  getAll(): undefined {
    return undefined;
  }

  get(id: GameIdentifier): Observable<Game | null> {
    return this.delegate.get(id);
  }

  add(scenario: string): Observable<Game> {
    return this.delegate.add(scenario) as Observable<Game>;
  }

  startGame(id: GameIdentifier): Observable<Game> {
    return this.delegate.startGame(id);
  }

  stopGame(id: GameIdentifier): Observable<Game> {
    return this.delegate.stopGame(id);
  }

  joinGame(identifier: GameIdentifier): Observable<Game> {
    return this.delegate.joinGame(identifier);
  }

  endRecruitment(identifier: GameIdentifier): Observable<Game> {
    return this.delegate.endRecruitment(identifier);
  }

  getCurrentGameId(): Observable<GameIdentifier | null> {
    return this.delegate.getCurrentGameId();
  }

}// class

