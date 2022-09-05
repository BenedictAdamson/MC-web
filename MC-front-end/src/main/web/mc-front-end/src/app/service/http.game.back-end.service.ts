import {Observable, of} from 'rxjs';

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {AbstractGameBackEndService} from './abstract.game.back-end.service';
import {Game} from '../game';
import {catchError, map} from "rxjs/operators";
import {HttpKeyValueService} from "./http.key-value.service";
export class EncodedGame {
  identifier: string;
  scenario: string;
  created: string;
  runState: string;
  recruiting: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  users: object;
}

export const CURRENTGAMEPATH = '/api/self/current-game';


class Delegate extends HttpKeyValueService<string, Game, EncodedGame, string, void> {

  constructor(
    http: HttpClient
  ) {
    super(http, undefined);
  }


  getUrl(id: string): string {
    return HttpGameBackEndService.getApiGamePath(id);
  }

  getAll(): undefined {
    return undefined;
  }

  startGame(id: string): Observable<Game> {
    return this.http.post<Game>(HttpGameBackEndService.getApiStartGamePath(id), '');
  }

  stopGame(id: string): Observable<Game> {
    return this.http.post<Game>(HttpGameBackEndService.getApiStopGamePath(id), '');
  }


  protected getAddUrl(scenario: string): string {
    return HttpGameBackEndService.getApiGamesOfScenarioPath(scenario);
  }

  protected getAddPayload(_scenario: string): null {
    return null;
  }

  joinGame(identifier: string): Observable<Game> {
    return this.http.post<Game>(HttpGameBackEndService.getApiJoinGamePath(identifier), '').pipe(
      map(v => this.decode(v))
    );
  }

  endRecruitment(identifier: string): Observable<Game> {
    return this.http.post<Game>(HttpGameBackEndService.getApiGameEndRecruitmentPath(identifier), '').pipe(
      map(v => this.decode(v))
    );
  }

  getCurrentGameId(): Observable<string | null> {
    return this.http.get<Game>(CURRENTGAMEPATH).pipe(
      catchError(() => of(null)),
      map(g => g ? g.identifier : null)
    );
  }

  protected decode(encodedValue: EncodedGame): Game {
    const users: Map<string, string> = new Map(Object.entries(encodedValue.users).map(([k, v]) => ([k, v])));
    return new Game(encodedValue.identifier, encodedValue.scenario, encodedValue.created, encodedValue.runState, encodedValue.recruiting, users);
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

  static getApiGamesOfScenarioPath(scenario: string): string {
    return '/api/scenario/' + scenario + '/games';
  }

  static getApiGamePath(id: string): string {
    return '/api/game/' + id;
  }

  static getApiStartGamePath(id: string): string {
    return HttpGameBackEndService.getApiGamePath(id) + '?start';
  }

  static getApiStopGamePath(id: string): string {
    return HttpGameBackEndService.getApiGamePath(id) + '?stop';
  }
  static getApiJoinGamePath(game: string): string {
    return HttpGameBackEndService.getApiGamePath(game) + '?join';
  }

  static getApiGameEndRecruitmentPath(game: string): string {
    return HttpGameBackEndService.getApiGamePath(game) + '?endRecruitment';
  }


  getAll(): undefined {
    return undefined;
  }

  get(id: string): Observable<Game | null> {
    return this.delegate.get(id);
  }

  add(scenario: string): Observable<Game> {
    return this.delegate.add(scenario) as Observable<Game>;
  }

  startGame(id: string): Observable<Game> {
    return this.delegate.startGame(id);
  }

  stopGame(id: string): Observable<Game> {
    return this.delegate.stopGame(id);
  }

  joinGame(identifier: string): Observable<Game> {
    return this.delegate.joinGame(identifier);
  }

  endRecruitment(identifier: string): Observable<Game> {
    return this.delegate.endRecruitment(identifier);
  }

  getCurrentGameId(): Observable<string | null> {
    return this.delegate.getCurrentGameId();
  }

}// class

