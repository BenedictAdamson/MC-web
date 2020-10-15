import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Scenario } from './scenario';

@Injectable({
	providedIn: 'root'
})
export class ScenarioService {

	private scenarioUrl = '/api/scenario';  // URL to API

	constructor(
		private http: HttpClient) { }

	getScenarios(): Observable<Scenario[]> {
		return this.http.get<Scenario[]>(this.scenarioUrl)
			.pipe(
				catchError(this.handleError<Scenario[]>('getScenarios', []))
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
