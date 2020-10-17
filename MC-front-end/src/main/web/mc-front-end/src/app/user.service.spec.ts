import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { UserService } from './user.service';
import { User } from './user';


describe('UserService', () => {
	let httpTestingController: HttpTestingController;

	const USER_A: User = { username: 'Benedict', password: 'letmein', authorities: [] };
	const USER_B: User = { username: 'jeff', password: 'secret', authorities: [] };

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

	let canGetUser: CallableFunction;
	canGetUser = (testUser: User) => {
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

	let canAddUser = function(user: User) {
		const service: UserService = TestBed.get(UserService);

		service.add(user).subscribe(ok => expect(ok).withContext('indicates success').toBeTrue());

		const request = httpTestingController.expectOne(`/api/user`);
		expect(request.request.method).toEqual('POST');
		request.flush("", { status: 201, statusText: 'Created' });
		httpTestingController.verify();
	};
	it('can add [A]', () => {
		canAddUser(USER_A);
	});
	it('can add [B]', () => {
		canAddUser(USER_B);
	});
});
