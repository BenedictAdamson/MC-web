import { Observable, of } from 'rxjs';

import { AbstractKeyValueService } from '../abstract.key-value.service'


export class Id {
	i: number;
}// class


export class Data {
	field: string;
}// class


export class Value {
	id: Id;
	data: Data;
}// class


export class MockKeyValueService extends AbstractKeyValueService<Id, Value, Data> {

	public values: Value[] = [];
	public nCalls_getAll: number = 0;
	public nCalls_get: number = 0;
	public nCalls_add: number = 0;
	private n: number = 0;

	constructor(
		private hasGetAll: boolean,
		private hasAdd: boolean,
		data: Data[]
	) {
		super();
		for (let datum of data) {
			this.addDatum(datum);
		}
	}

	getAll(): Observable<Value[]> | undefined {
		++this.nCalls_getAll;
		if (this.hasGetAll) {
			return of(this.values);
		} else {
			return undefined;
		}
	}

	private getImmediateForId(id: Id): Value | null {
		for (let value of this.values) {
			if (id.i == value.id.i) {
				return value;
			}
		}
		return null;
	}

	private getImmediateForData(data: Data): Value | null {
		for (let value of this.values) {
			if (data.field == value.data.field) {
				return value;
			}
		}
		return null;
	}

	get(id: Id): Observable<Value | null> {
		++this.nCalls_get;
		return of(this.getImmediateForId(id));
	}

	private addDatum(specification: Data): Value {
		const value: Value = { id: { i: this.n++ }, data: specification };
		this.values.push(value);
		return value;
	}

	add(specification: Data): Observable<Value> | undefined {
		++this.nCalls_add;
		if (this.hasAdd) {
			var result: Value | null = this.getImmediateForData(specification);
			if (!result) {
				result = this.addDatum(specification);
			}
			return of(result);
		} else {
			return undefined;
		}
	}

	alter(i: number, data: Data) {
		const oldValue: Value = this.values[i];
		const newValue: Value = { id: oldValue.id, data: data };
		this.values[i] = newValue;
	}
}
