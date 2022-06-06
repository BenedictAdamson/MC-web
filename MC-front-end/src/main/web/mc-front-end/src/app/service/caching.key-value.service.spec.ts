import { Observable } from 'rxjs';

import { AbstractKeyValueService } from './abstract.key-value.service'
import { CachingKeyValueService } from './caching.key-value.service';
import { Data, Id, MockKeyValueService, Value } from './mock/mock.key-value.service';



class TestCachingKeyValueService extends CachingKeyValueService<Id, Value, Data> {

	constructor(
		backEnd: AbstractKeyValueService<Id, Value, Data>
	) {
		super(backEnd);
	}

	protected createKeyString(id: Id): string {
		return 'k' + id.i;
	}

	protected getKey(value: Value): Id {
		return value.id;
	}

}// class


describe('CachingKeyValueService', () => {

	const DATA_A: Data = { field: 'fieldA' };
	const DATA_B: Data = { field: 'fieldB' };

  let backEnd: MockKeyValueService;
  let service: TestCachingKeyValueService;


  const setUp = function(
		hasGetAll: boolean,
		hasAdd: boolean,
		data: Data[]
	) {
		backEnd = new MockKeyValueService(hasGetAll, hasAdd, data);
		service = new TestCachingKeyValueService(backEnd);
	};


	it('can be created', () => {
		setUp(true, true, []);
		expect(service).toBeTruthy();
	});


	const testGetAll = function(
		data: Data[]
	) {
		setUp(true, true, data);

		const getAll: Observable<Value[]> | undefined = service.getAll();
		expect(getAll).withContext('getAll').toBeDefined();
		expect(backEnd.nCalls_getAll).withContext('back-end getAll calls').toEqual(1);
		if (getAll) {
			getAll.subscribe(users => expect(users).toEqual(backEnd.values));
		}
	};

	it('can not get all if back-end can not', () => {
		setUp(false, true, []);

		const getAll: Observable<Value[]> | undefined = service.getAll();
		expect(getAll).withContext('getAll').toBeUndefined();
	});

	it('can get all [0]', () => {
		testGetAll([]);
	});

	it('can get all [1]', () => {
		testGetAll([DATA_A]);
	});

	it('can get all [2]', () => {
		testGetAll([DATA_A, DATA_B]);
	});


	const testGet = function(specification: Data) {
		setUp(true, true, [specification]);
		const expectedValue: Value = backEnd.values[0];
		const id: Id = expectedValue.id;

		service.get(id).subscribe(value => expect(value).toEqual(expectedValue));
		expect(backEnd.nCalls_get).withContext('back-end get calls').toEqual(1);
	};

	it('can get [A]', () => {
		testGet(DATA_A);
	});

	it('can get [B]', () => {
		testGet(DATA_B);
	});


	const testAdd = function(specification: Data) {
		setUp(true, true, []);

		const add: Observable<Value> | undefined = service.add(specification);
		expect(add).withContext('add').toBeDefined();
		(add as Observable<Value>).subscribe(
			result => expect(result.data).withContext('returned value data').toEqual(specification)
		);
		expect(backEnd.nCalls_add).withContext('back-end add calls').toEqual(1);
	};

	it('can not add if back-end can not add', () => {
		setUp(true, false, []);

		const add: Observable<Value> | undefined = service.add(DATA_A);
		expect(add).withContext('add').toBeUndefined();
	});

	it('can add [A]', () => {
		testAdd(DATA_A);
	});

	it('can add [B]', () => {
		testAdd(DATA_B);
	});


	const testGetAfterUpdate = function(specification: Data) {
		setUp(true, true, [specification]);
		const expectedValue: Value = backEnd.values[0];
		const id: Id = expectedValue.id;

		service.update(id);
		service.get(id).subscribe(value => expect(value).toEqual(expectedValue));
		expect(backEnd.nCalls_get).withContext('back-end get calls').toEqual(1);
	};

	it('can get after update [A]', () => {
		testGetAfterUpdate(DATA_A);
	})

	it('can get after update [B]', () => {
		testGetAfterUpdate(DATA_B);
	})


	const testUpdateAfterGet = function(specification: Data) {
		setUp(true, true, [specification]);
		const expectedValue: Value = backEnd.values[0];
		const id: Id = expectedValue.id;

		service.get(id).subscribe(value => expect(value).toEqual(expectedValue));
		service.update(id);
		expect(backEnd.nCalls_get).withContext('back-end get calls').toEqual(2);
	};

	it('can update user after get user [A]', () => {
		testUpdateAfterGet(DATA_A);
	})

	it('can update user after get user [B]', () => {
		testUpdateAfterGet(DATA_B);
	})


	const testGetForChangingValue = function(
		done: any,
		specification1: Data,
		specification2: Data
	) {
		setUp(true, true, [specification1]);
		const id: Id = backEnd.values[0].id;
    let n: number = 0;

    service.get(id).subscribe(
			value => {
				expect(value).withContext('value').not.toBeNull();
				if (value) {
					expect(value.id).withContext('value.id').toEqual(id);
					expect(0 != n || specification1 == value.data).withContext('provides the first value').toBeTrue();
					expect(1 != n || specification2 == value.data).withContext('provides the second value').toBeTrue();
				}
				n++;
				expect(backEnd.nCalls_get).withContext('back-end get calls').toEqual(n);
				if (n == 2) done();
			}
		);
		backEnd.alter(0, specification2);
		service.update(id);
	};

	it('provides updated value [A]', (done) => {
		testGetForChangingValue(done, DATA_A, DATA_B);
	})

	it('provides updated value [B]', (done) => {
		testGetForChangingValue(done, DATA_B, DATA_A);
	})


	const testGetForUnchangedUpdate = function(specification: Data) {
		setUp(true, true, [specification]);
		const id: Id = backEnd.values[0].id;
    let n: number = 0;

    service.get(id).subscribe(
			value => {
				expect(value).withContext('value').not.toBeNull();
				if (value) {
					expect(value.id).withContext('value.id').toEqual(id);
					expect(value.data).withContext('value.data').toEqual(specification);
				}
				n++;
				expect(n).withContext('number emitted').toEqual(1);
			}
		);
		service.update(id);
	};

	it('provides distinct values [A]', () => {
		testGetForUnchangedUpdate(DATA_A);
	})

	it('provides distinct values [B]', () => {
		testGetForUnchangedUpdate(DATA_B);
	})



	const testGetAfterAdd = function(done: any, specification: Data) {
		setUp(true, true, []);

		const add: Observable<Value> | undefined = service.add(specification);
		expect(add).withContext('add').toBeDefined();
		if (add) {
			add.subscribe(
				result => {
					expect(result.data).withContext('returned value').toEqual(specification);
					service.get(result.id).subscribe(
						result2 => {
							expect(result2).toEqual(result);
							expect(backEnd.nCalls_add).withContext('back-end add calls').toEqual(1);
							// No get expected because should use a cached value.
							expect(backEnd.nCalls_get).withContext('back-end get calls').toEqual(0);
							done();
						}
					);
				}
			);
		}
	};

	it('can get after add [A]', (done) => {
		testGetAfterAdd(done, DATA_A);
	})

	it('can get after add [B]', (done) => {
		testGetAfterAdd(done, DATA_B);
	})
});
