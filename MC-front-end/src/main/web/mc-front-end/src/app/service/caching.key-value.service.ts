import { Observable, ReplaySubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, first, map, mergeMap, tap } from 'rxjs/operators';

import { AbstractKeyValueService } from './abstract.key-value.service';

export abstract class CachingKeyValueService<KEY, VALUE, SPECIFICATION>
	extends AbstractKeyValueService<KEY, VALUE, SPECIFICATION> {

	private complete = false;
	private validKeys$: ReplaySubject<KEY[]> = new ReplaySubject(1);
	private values: Map<string, ReplaySubject<VALUE | null>> = new Map();


	constructor(
		private backEnd: AbstractKeyValueService<KEY, VALUE, SPECIFICATION>
	) {
		super();
	}

	get(key: KEY): Observable<VALUE | null> {
		const id: string = this.createKeyString(key);
		let rs: ReplaySubject<VALUE | null> | undefined = this.values.get(id);
		if (!rs) {
			rs = this.createCache(id);
			this.updateCached(key, rs);
		}
		return rs.pipe(
			distinctUntilChanged()
		);
	}


	update(key: KEY) {
		const id: string = this.createKeyString(key);
		let rs: ReplaySubject<VALUE | null> | undefined = this.values.get(id);
		if (!rs) {
			rs = this.createCache(id);
		}
		this.updateCached(key, rs);
	}

	getAll(): Observable<VALUE[]> | undefined {
		const backEndGetAll: Observable<VALUE[]> | undefined = this.backEnd.getAll();
		if (backEndGetAll) {
			if (!this.complete) {
				this.updateAllUsing(backEndGetAll);
			}
			return this.getDefinedAll();
		} else {
			return undefined;
		}
	}


	/**
	 * Ask the service to update its cached value for the list of all values, if that is possible.
	 *
	 * The method does not block, but instead performs the update asynchronously.
	 * The updated value will eventually become available through the [[Observable]]
	 * returned by [[getAll]].
	 */
	updateAll(): void {
		const backEndGetAll: Observable<VALUE[]> | undefined = this.backEnd.getAll();
		if (backEndGetAll) {
			this.updateAllUsing(backEndGetAll);
		}
	}


	add(specification: SPECIFICATION): Observable<VALUE> | undefined {
		const backEndAdd: Observable<VALUE> | undefined = this.backEnd.add(specification);
		if (backEndAdd) {
			return backEndAdd.pipe(
				tap(value => this.setValue(value))
			);
		} else {
			return undefined;
		}
	}

	protected setValue(value: VALUE): void {
		const key: KEY | undefined = this.getKey(value);
		if (key) {
			const id: string = this.createKeyString(key);
			let rs: ReplaySubject<VALUE | null> | undefined = this.values.get(id);
			if (!rs) {
				rs = this.createCache(id);
			}
			rs.next(value);
			this.addValidKey(key);
		}
	}


	private addValidKey(key: KEY): void {
		const id: string = this.createKeyString(key);
		this.validKeys$.pipe(
			first() // once only
		).subscribe((keys: KEY[]) => {
			if (!keys.map(k => this.createKeyString(k)).includes(id)) {
				keys.push(key);
				this.validKeys$.next(keys);
			}// else already known
		});
	}

	private removeInvalidKey(key: KEY): void {
		const id: string = this.createKeyString(key);
		this.validKeys$.pipe(
			first() // once only
		).subscribe((keys: KEY[]) => {
			const newKeys: KEY[] = keys.filter(k => this.createKeyString(k) !== id);
			if (newKeys.length !== keys.length) {
				this.validKeys$.next(newKeys);
			}// else already known to be invalid
		});
	}

	private updateCached(key: KEY, rs: ReplaySubject<VALUE | null>): void {
		this.backEnd.get(key).subscribe((value: VALUE | null) => {
			rs.next(value);
			if (value) {
				this.addValidKey(key);
			} else {
				this.removeInvalidKey(key);
			}
		});
	}

	private createCache(id: string): ReplaySubject<VALUE> {
		const rs: ReplaySubject<VALUE> = new ReplaySubject<VALUE>(1);
		this.values.set(id, rs);
		return rs;
	}


	private getDefinedAll(): Observable<VALUE[]> {
		return this.validKeys$.pipe(
			distinctUntilChanged(),// do not spam changes
			map((keys: KEY[]) => {// get the ReplySubjects for the valid keys
				const rses: Observable<VALUE | null>[] = [];
				for (const key of keys) {
					const id: string = this.createKeyString(key);
					const rs: ReplaySubject<VALUE | null> | undefined = this.values.get(id);
					if (rs) {
						rses.push(rs.asObservable());
					};
				}
				return rses;
			}),
			mergeMap((rses: Observable<VALUE | null>[]) =>
				combineLatest(rses).pipe(
					// remove nulls
					map((values: (VALUE | null)[]) => values.filter((value) => !!value) as VALUE[])
				))
		);
	}

	private updateAllUsing(backEndGetAll: Observable<VALUE[]>): void {
		backEndGetAll.subscribe(
			(values: VALUE[]) => {
				values.forEach(value => this.setValue(value));
				// Remove keys that are no longer valid:
				const keys: KEY[] = values.map(value => this.getKey(value) as KEY);
				this.validKeys$.next(keys);
				this.complete = true;
			});
	}

	protected abstract createKeyString(id: KEY): string;

	protected abstract getKey(value: VALUE): KEY | undefined;
}
