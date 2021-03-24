import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AbstractGameBackEndService } from './abstract.game.back-end.service';
import { HttpSimpleKeyValueService } from './http.simple-key-value.service';
import { Game } from '../game';
import { GameIdentifier } from '../game-identifier';


const apiScenariosPath = '/api/scenario/';


class Delegate extends HttpSimpleKeyValueService<GameIdentifier, Game, string, null> {

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


   protected getAddUrl(scenario: string): string {
      return HttpGameBackEndService.getApiGamesPath(scenario);
   }

   protected getAddPayload(_scenario: string): null {
      return null;
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
      return HttpGameBackEndService.getApiGamePath(id) + '?join';
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

}// class

