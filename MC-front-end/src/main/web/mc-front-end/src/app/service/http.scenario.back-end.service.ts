import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AbstractScenarioBackEndService } from './abstract.scenario.back-end.service';
import { HttpSimpleKeyValueService } from './http.simple-key-value.service';
import { NamedUUID } from '../named-uuid';
import { Scenario } from '../scenario';


const apiScenariosPath = '/api/scenario';


class Delegate extends HttpSimpleKeyValueService<string, Scenario, string, null> {

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


   get(id: string): Observable<Scenario | null> {
      return this.delegate.get(id);
   }

   getScenarioIdentifiers(): Observable<NamedUUID[]> {
      return this.delegate.getScenarioIdentifiers();
   }

}// class

