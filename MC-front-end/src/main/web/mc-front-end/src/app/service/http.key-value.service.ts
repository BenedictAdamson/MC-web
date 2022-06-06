import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';

import { AbstractKeyValueService } from './abstract.key-value.service';

export abstract class HttpKeyValueService<KEY, VALUE, ENCODEDVALUE, SPECIFICATION, ADDPAYLOAD>
	extends AbstractKeyValueService<KEY, VALUE, SPECIFICATION> {


	protected constructor(
		protected http: HttpClient,
		public allUrl: string | undefined
	) {
		super();
	}

	getAll(): Observable<VALUE[]> | undefined {
		if (this.allUrl) {
			return this.http.get<ENCODEDVALUE[]>(this.allUrl as string).pipe(
				map(vs => vs.map(v => this.decode(v)))
			);
		} else {
			return undefined;
		}
	}

	get(id: KEY): Observable<VALUE | null> {
		return this.http.get<ENCODEDVALUE>(this.getUrl(id)).pipe(
			map(v => this.decode(v))
		);
	}

	add(specification: SPECIFICATION): Observable<VALUE> | undefined {
		const url: string | undefined = this.getAddUrl(specification);
		/* The server probably replies to the POST with a 302 (Found) redirect to the resource of the created value.
		 * The HttpClient or browser itself handles that redirect for us.
		 */
		if (url) {
			return this.http.post<ENCODEDVALUE>(url as string, this.getAddPayload(specification)).pipe(
				map(v => this.decode(v))
			);
		} else {
			return undefined;
		}
	}


	abstract getUrl(id: KEY): string;

	protected abstract getAddUrl(specification: SPECIFICATION): string | undefined;

	protected abstract getAddPayload(specification: SPECIFICATION): ADDPAYLOAD;

	protected abstract decode(encodedValue: ENCODEDVALUE): VALUE;

}
