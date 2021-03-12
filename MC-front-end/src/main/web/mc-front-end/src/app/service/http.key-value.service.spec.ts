import { Observable } from 'rxjs';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { HttpKeyValueService } from './http.key-value.service';


class Id {
	first: string;
	second: string;
}// class


class Data {
	field: string;
}// class


class Value {
	id: Id;
	data: Data;
}// class


class EncodedValue {
	id: Id;
	data: Data;
	extra: string;
}// class


class TestHttpKeyValueService extends HttpKeyValueService<Id, Value, EncodedValue, Data, Data> {

	constructor(
		http: HttpClient,
		allUrl: string | undefined,
		private addUrl: string | undefined
	) {
		super(http, allUrl);
	}


	getUrl(id: Id): string {
		return id.first + '/' + id.second;
	}

	protected getAddUrl(_specification: Data): string | undefined {
		return this.addUrl;
	}

	protected getAddPayload(specification: Data): Data {
		return specification;
	}

	protected decode(encodedValue: EncodedValue): Value {
		return { id: encodedValue.id, data: encodedValue.data };
	}

}


describe('HttpKeyValueService', () => {
	let httpTestingController: HttpTestingController;
	let service: HttpKeyValueService<Id, Value, EncodedValue, Data, Data>;

	const ID_A: Id = { first: 'A', second: '1' };
	const ID_B: Id = { first: 'B', second: '2' };
	const DATA_A: Data = { field: 'fieldA' };
	const DATA_B: Data = { field: 'fieldB' };
	const VALUE_A: Value = { id: ID_A, data: DATA_A };
	const VALUE_B: Value = { id: ID_B, data: DATA_B };
	const ENCODED_VALUE_A: EncodedValue = { id: ID_A, data: DATA_A, extra: 'extra1' };
	const ENCODED_VALUE_B: EncodedValue = { id: ID_B, data: DATA_B, extra: 'extra2' };

	const setUp = (
		allUrl: string | undefined,
		addUrl: string | undefined) => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule]
		});

		/* Inject for each test:
		 * HTTP requests will be handled by the mock back-end.
		  */
		const http: HttpClient = TestBed.inject(HttpClient);
		httpTestingController = TestBed.inject(HttpTestingController);
		service = new TestHttpKeyValueService(http, allUrl, addUrl);
	};

	const testConstructor = (
		allUrl: string | undefined,
		addUrl: string | undefined) => {
		setUp(allUrl, addUrl);

		expect(service).toBeTruthy();
	};

	it('can be constructed [all URLs]', () => {
		testConstructor('/value', '/value?add');
		expect(service.getAll()).withContext('getAll').toBeDefined();
		expect(service.add(DATA_A)).withContext('add').toBeDefined();
	});

	it('can be constructed [can not getAll]', () => {
		testConstructor(undefined, '/value?add');
		expect(service.getAll()).withContext('getAll').not.toBeDefined();
		expect(service.add(DATA_A)).withContext('add').toBeDefined();
	});

	it('can be constructed [can not add]', () => {
		testConstructor('/value', undefined);
		expect(service.getAll()).withContext('getAll').toBeDefined();
		expect(service.add(DATA_A)).withContext('add').not.toBeDefined();
	});

	const testGetAll = (allUrl: string) => {
		setUp(allUrl, '/value?add');
		const encodedValues: EncodedValue[] = [ENCODED_VALUE_A, ENCODED_VALUE_B];
		const expectedValues: Value[] = [VALUE_A, VALUE_B];

		const getAll: Observable<Value[]> | undefined = service.getAll();
		expect(getAll).withContext('getAll').toBeDefined();
		(getAll as Observable<Value[]>).subscribe(values => expect(values).toEqual(expectedValues));

		const request = httpTestingController.expectOne(allUrl);
		expect(request.request.method).toEqual('GET');
		request.flush(encodedValues);
		httpTestingController.verify();
	};

	it('can get all [A]', () => {
		testGetAll('/value');
	});

	it('can get all [B]', () => {
		testGetAll('/values');
	});

	const testGet = (encodedValue: EncodedValue) => {
		const expectedValue: Value = { id: encodedValue.id, data: encodedValue.data };
		const id: Id = expectedValue.id;
		const expectedPath: string = id.first + '/' + id.second;
		setUp('/value', '/value?add');

		service.get(id).subscribe(value => expect(value).toEqual(expectedValue));

		const request = httpTestingController.expectOne(expectedPath);
		expect(request.request.method).toEqual('GET');
		request.flush(encodedValue);
		httpTestingController.verify();
	};
	it('can get [A]', () => {
		testGet(ENCODED_VALUE_A);
	});
	it('can get [B]', () => {
		testGet(ENCODED_VALUE_B);
	});

	const testAdd = (addUrl: string, value: Value) => {
		const specification: Data = value.data;
		setUp('/value', addUrl);

		const add: Observable<Value> | undefined = service.add(specification);
		expect(add).withContext('add').toBeDefined();
		(add as Observable<Value>).subscribe(result => expect(result).withContext('returned value').toEqual(value));

		const request = httpTestingController.expectOne(addUrl);
		expect(request.request.method).toEqual('POST');
		request.flush(value);
		httpTestingController.verify();
	};
	it('can add [A]', () => {
		testAdd('/value', VALUE_A);
	});
	it('can add [B]', () => {
		testAdd('/values?add', VALUE_B);
	});

});
