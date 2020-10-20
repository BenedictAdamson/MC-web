import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Scenario } from './scenario';
import { ScenarioIdentifier } from './scenario-identifier';

@Injectable({
	providedIn: 'root'
})
export class ScenarioService {

	private scenarioUrl = '/api/scenario';  // URL to API

	constructor(
		private http: HttpClient) { }

	getScenarioIdentifiers(): Observable<ScenarioIdentifier[]> {
		return this.http.get<ScenarioIdentifier[]>(this.scenarioUrl)
			.pipe(
				catchError(this.handleError<ScenarioIdentifier[]>('getScenarioIdentifiers', []))
			);
	}

	getScenario(id: string): Observable<Scenario> {
		const url = `${this.scenarioUrl}/${id}`;
		return this.http.get<Scenario>(url)
			.pipe(
				catchError(this.handleError<Scenario>(`getScenario id=${id}`))
			);
	}
    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
	private handleError<T>(operation = 'operation', result?: T) {
		return (error: any): Observable<T> => {

			// TODO: send the error to remote logging infrastructure
			console.error(operation + error); // log to console instead

			// Let the app keep running by returning an empty result.
			return of(result as T);
		};
	}
}
