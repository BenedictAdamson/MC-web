import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AbstractScenarioBackEndService } from './abstract.scenario.back-end.service';
import { HttpSimpleKeyValueService } from './http.simple-key-value.service';
import { NamedUUID } from '../named-uuid';
import { Scenario } from '../scenario';


const apiScenariosPath = '/api/scenario';


class EncodedScenario {
   public identifier: string;
   public title: string;
   public description: string;
   public characters: NamedUUID[];
};


class Delegate extends HttpSimpleKeyValueService<string, EncodedScenario, string, null> {

   constructor(
      http: HttpClient
   ) {
      super(http, undefined);
   }

   static getApiScenarioPath(scenario: string): string {
      return apiScenariosPath + '/' + scenario;
   }


   getUrl(id: string): string {
      return Delegate.getApiScenarioPath(id);
   }

   getAll(): undefined {
      return undefined;
   }

   getScenarioIdentifiers(): Observable<NamedUUID[]> {
      return this.http.get<NamedUUID[]>(apiScenariosPath);
   }


   protected getAddUrl(_scenario: string): undefined {
      return undefined;
   }

   protected getAddPayload(_scenario: string): null {
      return null;
   }

}// class


@Injectable({
   providedIn: 'root'
})
export class HttpScenarioBackEndService extends AbstractScenarioBackEndService {

   private delegate: Delegate;


   constructor(
      http: HttpClient
   ) {
      super();
      this.delegate = new Delegate(http);
   }

   static getApiScenarioPath(scenario: string): string {
      return Delegate.getApiScenarioPath(scenario);
   }

   private static decode(encoded: EncodedScenario): Scenario {
      return new Scenario(
         encoded.identifier,
         encoded.title,
         encoded.description,
         encoded.characters);
   }


   get(id: string): Observable<Scenario | null> {
      return this.delegate.get(id).pipe(
         map(encoded => encoded ? HttpScenarioBackEndService.decode(encoded) : null)
      );
   }

   getScenarioIdentifiers(): Observable<NamedUUID[]> {
      return this.delegate.getScenarioIdentifiers();
   }

}// class

