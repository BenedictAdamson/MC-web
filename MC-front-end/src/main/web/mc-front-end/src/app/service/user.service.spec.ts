import { v4 as uuid } from 'uuid';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { UserDetails } from '../user-details';
import { UserService } from './user.service';
import { User } from '../user';


describe('UserService', () => {
	let httpTestingController: HttpTestingController;

	const USER_DETAILS_A: UserDetails = { username: 'Benedict', password: 'letmein', authorities: [] };
	const USER_A: User = new User(uuid(), USER_DETAILS_A);
	const USER_DETAILS_B: UserDetails = { username: 'jeff', password: 'secret', authorities: [] };
	const USER_B: User = new User(uuid(), USER_DETAILS_B);

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule]
		});

		/* Inject for each test:
		 * HTTP requests will be handled by the mock back-end.
		  */
		TestBed.get(HttpClient);
		httpTestingController = TestBed.get(HttpTestingController);
	});

	it('should be created', () => {
		const service: UserService = TestBed.get(UserService);
		expect(service).toBeTruthy();
	});

	it('can get users', () => {
		const testUsers: User[] = [USER_A, USER_B];
		const service: UserService = TestBed.get(UserService);

		service.getUsers().subscribe(users => expect(users).toEqual(testUsers));

		const request = httpTestingController.expectOne(UserService.apiUsersPath);
		expect(request.request.method).toEqual('GET');
		request.flush(testUsers);
		httpTestingController.verify();
	});

	const canGetUser = function(testUser: User) {
		const id: string = testUser.id;
		const expectedPath: string = UserService.getApiUserPath(id);
		const service: UserService = TestBed.get(UserService);

		service.getUser(id).subscribe(user => expect(user).toEqual(testUser));

		const request = httpTestingController.expectOne(expectedPath);
		expect(request.request.method).toEqual('GET');
		request.flush(testUser);
		httpTestingController.verify();
	};
	it('can get [A]', () => {
		canGetUser(USER_A);
	});
	it('can get [B]', () => {
		canGetUser(USER_B);
	});

	const canAddUser = function(user: User) {
		const userDetails: UserDetails = new UserDetails(user);
		const service: UserService = TestBed.get(UserService);

		service.add(userDetails).subscribe(result => expect(result).withContext('returned user').toEqual(user));

		const request = httpTestingController.expectOne(UserService.apiUsersPath);
		expect(request.request.method).toEqual('POST');
		request.flush(user);
		httpTestingController.verify();
	};
	it('can add [A]', () => {
		canAddUser(USER_A);
	});
	it('can add [B]', () => {
		canAddUser(USER_B);
	});





	const testGetUserAfterUpdateUser = function(user: User) {
		const id: string = user.id;
		const expectedPath: string = UserService.getApiUserPath(id);
		const service: UserService = TestBed.get(UserService);

		service.updateUser(id);
		service.getUser(id).subscribe(u => expect(u).toEqual(user));

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
		const expectedPath: string = UserService.getApiUserPath(id);
		const service: UserService = TestBed.get(UserService);

		service.getUser(id).subscribe(u => expect(u).toEqual(user));
		service.updateUser(id);

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
});
