import { v4 as uuid } from 'uuid';

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { AbstractUserBackEndService } from './abstract.user.back-end.service';
import { HttpUserBackEndService, getApiUserPath, apiUsersPath } from './http.user.back-end.service';
import { UserDetails } from '../user-details';
import { UserService } from './user.service';
import { User } from '../user';


describe('UserService', () => {
	let httpTestingController: HttpTestingController;

	const USERNAME_A: string = 'Benedict';
	const USERNAME_B: string = 'jeff';
	const PASSWORD_A: string = 'letmein';
	const PASSWORD_B: string = 'secret';
	const AUTHORITIES_A: string[] = [];
	const AUTHORITIES_B: string[] = ['ROLE_PLAYER'];
	const USER_DETAILS_A: UserDetails = { username: USERNAME_A, password: PASSWORD_A, authorities: AUTHORITIES_A };
	const USER_DETAILS_B: UserDetails = { username: USERNAME_B, password: PASSWORD_B, authorities: AUTHORITIES_B };
	const USER_ID_A: string = uuid();
	const USER_ID_B: string = uuid();
	const USER_A: User = new User(USER_ID_A, USER_DETAILS_A);
	const USER_B: User = new User(USER_ID_B, USER_DETAILS_B);

	const setUp = function(): UserService {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule]
		});

		const httpClient: HttpClient = TestBed.inject(HttpClient);
		httpTestingController = TestBed.inject(HttpTestingController);
		const backEnd: AbstractUserBackEndService = new HttpUserBackEndService(httpClient);
		return new UserService(backEnd);
	};

	it('should be created', () => {
		const service: UserService = setUp();
		expect(service).toBeTruthy();
	});

	it('can get all users', () => {
		const testUsers: User[] = [USER_A, USER_B];
		const service: UserService = setUp();

		service.getAll().subscribe(users => expect(users).toEqual(testUsers));

		const request = httpTestingController.expectOne(apiUsersPath);
		expect(request.request.method).toEqual('GET');
		request.flush(testUsers);
		httpTestingController.verify();
	});

	const testGet = function(testUser: User) {
		const id: string = testUser.id;
		const expectedPath: string = getApiUserPath(id);
		const service: UserService = setUp();

		service.get(id).subscribe(user => expect(user).toEqual(testUser));

		const request = httpTestingController.expectOne(expectedPath);
		expect(request.request.method).toEqual('GET');
		request.flush(testUser);
		httpTestingController.verify();
	};
	it('can get [A]', () => {
		testGet(USER_A);
	});
	it('can get [B]', () => {
		testGet(USER_B);
	});

	const testAdd = function(user: User) {
		const userDetails: UserDetails = new UserDetails(user);
		const service: UserService = setUp();

		service.add(userDetails).subscribe(result => expect(result).withContext('returned user').toEqual(user));

		const request = httpTestingController.expectOne(apiUsersPath);
		expect(request.request.method).toEqual('POST');
		request.flush(user);
		httpTestingController.verify();
	};
	it('can add [A]', () => {
		testAdd(USER_A);
	});
	it('can add [B]', () => {
		testAdd(USER_B);
	});



	const testGetUserAfterUpdateUser = function(user: User) {
		const id: string = user.id;
		const expectedPath: string = getApiUserPath(id);
		const service: UserService = setUp();

		service.update(id);
		service.get(id).subscribe(u => expect(u).toEqual(user));

		// Only one GET expected because should use the cached value.
		const request = httpTestingController.expectOne(expectedPath);
		expect(request.request.method).toEqual('GET');
		request.flush(user);
		httpTestingController.verify();
	};

	it('can get user after update user [A]', () => {
		testGetUserAfterUpdateUser(USER_A);
	})

	it('can get user after update user [B]', () => {
		testGetUserAfterUpdateUser(USER_B);
	})



	const testUpdateUserAfterGetUser = function(user: User) {
		const id: string = user.id;
		const expectedPath: string = getApiUserPath(id);
		const service: UserService = setUp();

		service.get(id).subscribe(u => expect(u).toEqual(user));
		service.update(id);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].flush(user);
		expect(requests[1].request.method).toEqual('GET');
		requests[1].flush(user);
		httpTestingController.verify();
	};

	it('can update user after get user [A]', () => {
		testUpdateUserAfterGetUser(USER_A);
	})

	it('can update user after get user [B]', () => {
		testUpdateUserAfterGetUser(USER_B);
	})





	const testGetUserForChangingValue = function(
		done: any,
		id: string,
		username1: string,
		password1: string,
		authorities1: string[],
		username2: string,
		password2: string,
		authorities2: string[]
	) {
		const user1: User = { id: id, username: username1, password: password1, authorities: authorities1 };
		const user2: User = { id: id, username: username2, password: password2, authorities: authorities2 };
		const expectedPath: string = getApiUserPath(id);
		const service: UserService = setUp();
    let n: number = 0;

    service.get(id).subscribe(
			user => {
				expect(0 != n || user1 == user).withContext('provides the first value').toBeTrue();
				expect(1 != n || user2 == user).withContext('provides the second value').toBeTrue();
				n++;
				if (n == 2) done();
			}
		);
		service.update(id);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].flush(user1);
		expect(requests[1].request.method).toEqual('GET');
		requests[1].flush(user2);
		httpTestingController.verify();
	};

	it('provides updated user [A]', (done) => {
		testGetUserForChangingValue(
			done, USER_ID_A, USERNAME_A, PASSWORD_A, AUTHORITIES_A, USERNAME_B, PASSWORD_B, AUTHORITIES_B
		);
	})

	it('provides updated user [B]', (done) => {
		testGetUserForChangingValue(
			done, USER_ID_B, USERNAME_B, PASSWORD_B, AUTHORITIES_B, USERNAME_A, PASSWORD_A, AUTHORITIES_A
		);
	})



	const testGetUserForUnchangedUpdate = function(user: User) {
		const id: string = user.id;
		const expectedPath: string = getApiUserPath(id);
		const service: UserService = setUp();
    let n: number = 0;

    service.get(id).subscribe(
			u => {
				expect(user == u).withContext('provides the expected value').toBeTrue();
				n++;
				expect(n).withContext('number emitted').toEqual(1);
			}
		);
		service.update(id);

		const requests: TestRequest[] = httpTestingController.match(expectedPath);
		expect(requests.length).withContext('number of requests').toEqual(2);
		expect(requests[0].request.method).toEqual('GET');
		requests[0].flush(user);
		expect(requests[1].request.method).toEqual('GET');
		requests[1].flush(user);
		httpTestingController.verify();
	};

	it('provides distinct user values [A]', () => {
		testGetUserForUnchangedUpdate(USER_A);
	})

	it('provides distinct user values [B]', () => {
		testGetUserForUnchangedUpdate(USER_B);
	})





	const testGetUserAfterAdd = function(user: User) {
		fakeAsync(() => {
			const id: string = user.id;
			const userDetails: UserDetails = new UserDetails(user);
			const service: UserService = setUp();

			service.add(userDetails).subscribe(result => expect(result).withContext('returned user').toEqual(user));
			tick();
			service.get(id).subscribe(u => expect(u).toEqual(user));

			// No GET expected because should use a cached value.
			const request = httpTestingController.expectOne(apiUsersPath);
			expect(request.request.method).toEqual('POST');
			request.flush(user);
			httpTestingController.verify();
		})
	};

	it('can get user after add [A]', () => {
		testGetUserAfterAdd(USER_A);
	})

	it('can get user after add [B]', () => {
		testGetUserAfterAdd(USER_B);
	})
});
