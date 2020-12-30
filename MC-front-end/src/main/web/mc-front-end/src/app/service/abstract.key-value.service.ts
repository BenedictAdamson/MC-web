import { Observable } from 'rxjs';

export abstract class AbstractKeyValueService<KEY, VALUE, SPECIFICATION> {

	abstract getAll(): Observable<VALUE[]> | undefined;

	abstract get(id: KEY): Observable<VALUE | null>;

	abstract add(specification: SPECIFICATION): Observable<VALUE> | undefined;

}
