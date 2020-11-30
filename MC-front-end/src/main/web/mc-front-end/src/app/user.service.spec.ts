import { v4 as uuid } from 'uuid';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { UserDetails } from './user-details';
import { UserService } from './user.service';
import { User } from './user';


describe('UserService', () => {
	let httpTestingController: HttpTestingController;

	const USER_DETAILS_A: UserDetails = { username: 'Benedict', password: 'letmein', authorities: [] };
	const USER_A: User = new User(new uuid(), USER_DETAILS_A);
	const USER_DETAILS_B: UserDetails = { username: 'jeff', password: 'secret', authorities: [] };
	const USER_B: User = new User(new uuid(), USER_DETAILS_B);

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

		const request = httpTestingController.expectOne('/api/user');
		expect(request.request.method).toEqual('GET');
		request.flush(testUsers);
		httpTestingController.verify();
	});

	const canGetUser = function(testUser: User) {
		const username = testUser.username;
		const service: UserService = TestBed.get(UserService);

		service.getUser(username).subscribe(user => expect(user).toEqual(testUser));

		const request = httpTestingController.expectOne(`/api/user/${username}`);
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

		const request = httpTestingController.expectOne(`/api/user`);
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
});
