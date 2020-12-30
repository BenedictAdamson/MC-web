import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';

import { AbstractKeyValueService } from './abstract.key-value.service'

export abstract class HttpKeyValueService<KEY, VALUE, SPECIFICATION> extends AbstractKeyValueService<KEY, VALUE, SPECIFICATION> {


	constructor(
		private http: HttpClient,
		public allUrl: string | undefined,
		public addUrl: string | undefined
	) {
		super();
	}

	getAll(): Observable<VALUE[]> | undefined {
		if (this.allUrl) {
			return this.http.get<VALUE[]>(this.allUrl as string);
		} else {
			return undefined;
		}
	}

	get(id: KEY): Observable<VALUE | null> {
		return this.http.get<VALUE>(this.getUrl(id));
	}

	add(specification: SPECIFICATION): Observable<VALUE> | undefined {
		/* The server probably replies to the POST with a 302 (Found) redirect to the resource of the created value.
		 * The HttpClient or browser itself handles that redirect for us.
		 */
		if (this.addUrl) {
			return this.http.post<VALUE>(this.addUrl as string, specification);
		} else {
			return undefined;
		}
	}


	abstract getUrl(id: KEY): string;
}
