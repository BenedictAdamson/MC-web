import { HttpClient, HttpHeaders } from '@angular/common/http';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';

import { SelfService } from './self.service';
import { User } from './user';

describe('SelfService', () => {

	let getAuthenticated = function(service: SelfService): boolean {
		var authenticated: boolean = null;
		service.authenticated$.subscribe({
			next: (a) => authenticated = a,
			error: (err) => fail(err),
			complete: () => { }
		});
		return authenticated;
	};

	let getAuthorities = function(service: SelfService): string[] {
		var authorities: string[] = null;
		service.authorities$.subscribe({
			next: (a) => authorities = a,
			error: (err) => fail(err),
			complete: () => { }
		});
		return authorities;
	};

	let assertInvariants: CallableFunction = (s: SelfService) => {
		var authenticated: boolean = getAuthenticated(s);
		var authorities: string[] = getAuthorities(s);
		expect(authenticated && s.username == null).withContext('Not authenticated if username is null').toEqual(false);
		expect(!authenticated && 0 < authorities.length).withContext('A user that has not been authenticated has no authorities').toEqual(false);
	};

	const USER_A: User = { username: 'Administrator', password: 'letmein', authorities: ['ROLE_ADMIN'] };
	const USER_B: User = { username: 'Benedict', password: 'pasword123', authorities: [] };

	let httpClient: HttpClient;
	let httpTestingController: HttpTestingController;

	let service: SelfService;


	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule]
		});

        /* Inject for each test:
         * HTTP requests will be handled by the mock back-end.
          */
		httpClient = TestBed.get(HttpClient);
		httpTestingController = TestBed.get(HttpTestingController);
	});
	beforeEach(() => {
		service = new SelfService(httpClient);
	});

	it('constructs the initial state', () => {
		expect(service).toBeTruthy();
		assertInvariants(service);
		assertNotAuthenticated();
	});

	const expectAutheorizationRequestHeaders = function(expectAuthorizationHeader: boolean): TestRequest {
		const request: TestRequest = httpTestingController.expectOne('/api/self');
		expect(request.request.method).toEqual('GET');
		expect(request.request.headers.has("Authorization")).withContext('has Authorization header').toEqual(expectAuthorizationHeader);
		expect(request.request.headers.get("X-Requested-With")).withContext('X-Requested-With header').toEqual('XMLHttpRequest');
		return request;
	};

	const mockHttpAuthorizationFailure = function(expectAuthorizationHeader: boolean) {
		const request = expectAutheorizationRequestHeaders(expectAuthorizationHeader);
		request.flush("", { headers: new HttpHeaders(), status: 401, statusText: 'Unauthorized' });
		httpTestingController.verify();
	};

	it('contacts server for authentication', (done) => {
		service.authenticate("user", "password").subscribe({
			next: () => { },
			error: (err) => { fail(err); done() },
			complete: () => {
				assertInvariants(service);
				done()
			}
		});
		mockHttpAuthorizationFailure(true);
	});


	let testAuthenticationFailure = (done: any, username: string, password: string) => {
		service.authenticate(username, password).subscribe({
			next: (success) => {
				expect(success).withContext('success').toBeFalse();
			},
			error: (err) => { fail(err); done() },
			complete: () => {
				assertInvariants(service);
				expect(getAuthenticated(service)).toEqual(false, 'not authenticated');
				expect(service.username).toEqual(username, 'updated username');
				expect(service.password).toEqual(password, 'updated password');
				done()
			}
		});
		mockHttpAuthorizationFailure(true);
	};

	it('handles authentication failure [A]', (done) => {
		testAuthenticationFailure(done, USER_A.username, USER_A.password);
	});

	it('handles authentication failure [B]', (done) => {
		testAuthenticationFailure(done, USER_B.username, USER_B.password);
	});

	let mockHttpAuthorizationSuccess = function(userDetails: User, expectAuthorizationHeader: boolean) {
		const request = expectAutheorizationRequestHeaders(expectAuthorizationHeader);
		request.flush(userDetails, { headers: new HttpHeaders(), status: 200, statusText: 'Ok' });
		httpTestingController.verify();
	};

	const assertAuthenticated = function(userDetails: User) {
		var authenticated: boolean = getAuthenticated(service);
		var authorities: string[] = getAuthorities(service);
		expect(service.username).toEqual(userDetails.username, 'username');
		expect(service.password).toEqual(userDetails.password, 'password');
		expect(authorities).toEqual(userDetails.authorities, 'authorities');
		expect(authenticated).toEqual(true, 'authenticated');
	}

	const assertNotAuthenticated = function() {
		var authenticated: boolean = getAuthenticated(service);
		var authorities: string[] = getAuthorities(service);
		expect(service.username).withContext('username').toBeNull();
		expect(service.password).withContext('password').toBeNull();
		expect(authorities).withContext('authorities').toEqual([]);
		expect(authenticated).withContext('authenticated').toEqual(false);
	}




	let testAuthenticationSuccess = (done: any, userDetails: User) => {
		service.authenticate(userDetails.username, userDetails.password).subscribe({
			next: (success) => {
				expect(success).withContext('success').toBeTrue();
			},
			error: (err) => { fail(err); done() },
			complete: () => {
				assertInvariants(service);
				assertAuthenticated(userDetails);
				done()
			}
		});
		mockHttpAuthorizationSuccess(userDetails, true);
	};

	it('handles authentication success [A]', (done) => {
		testAuthenticationSuccess(done, USER_A);
	});

	it('handles authentication success [B]', (done) => {
		testAuthenticationSuccess(done, USER_B);
	});

	const testLogout = function(done: any) {
		service.logout().subscribe({
			next: () => {
				assertInvariants(service);
			},
			error: (err) => { fail(err); done() },
			complete: () => {
				assertInvariants(service);
				assertNotAuthenticated();
				done()
			}
		});
	}

	it('handles logout from the initial state', (done) => {
		testLogout(done);
	});

	it('handles logout while authenticated', (done) => {
		const userDetails: User = USER_A;
		service.authenticate(userDetails.username, userDetails.password).subscribe({
			next: () => { },
			error: (err) => { fail(err); done() },
			complete: () => {
				testLogout(done);
			}
		});
		mockHttpAuthorizationSuccess(userDetails, true);
	});


	const checkForCurrentAuthenticationNone = function(done: any) {
		service.checkForCurrentAuthentication().subscribe({
			next: () => { },
			error: (err) => { fail(err); done() },
			complete: () => {
				assertInvariants(service);
				assertNotAuthenticated();
				done();
			}
		});
		mockHttpAuthorizationFailure(false);
	}

	it('handles check for current authentication from the initial state', (done) => {
		checkForCurrentAuthenticationNone(done);
	});




	const checkForCurrentAuthenticationWithSesson = function(done: any, serverUserDetails: User) {
		const expectedFinalUserDetails: User = { username: serverUserDetails.username, password: null, authorities: serverUserDetails.authorities };
		service.checkForCurrentAuthentication().subscribe({
			next: () => { },
			error: (err) => { fail(err); done() },
			complete: () => {
				assertInvariants(service);
				assertAuthenticated(expectedFinalUserDetails);
				done();
			}
		});
		mockHttpAuthorizationSuccess(serverUserDetails, false);
	}

	const setUpAuthenticated = function(done: any, userDetails: User) {
		service.authenticate(userDetails.username, userDetails.password).subscribe({
			next: () => { },
			error: (err) => { fail(err); done() },
			complete: () => {
				done();
			}
		});
		mockHttpAuthorizationSuccess(userDetails, true);
	};


	const testCheckForCurrentAuthenticationWithSesson = function(done: any, userDetails: User) {
		setUpAuthenticated(
			() => checkForCurrentAuthenticationWithSesson(done, userDetails),
			userDetails
		);
	}


	it('handles check for current authentication while authenticated [A]', (done) => {
		testCheckForCurrentAuthenticationWithSesson(done, USER_A);
	});

	it('handles check for current authentication while authenticated [B]', (done) => {
		testCheckForCurrentAuthenticationWithSesson(done, USER_B);
	});



	const testServerAmendingUsername = function(done: any, username: string, password: string, serverUserDetails: User) {
		const expectedResultingUserDetails: User = {
			username: serverUserDetails.username,
			password: password,// the server will probably resturn null or the encrypted password
			authorities: serverUserDetails.authorities
		};
		service.authenticate(username, password).subscribe({
			next: (success) => {
				expect(success).withContext('success').toBeTrue();
			},
			error: (err) => { fail(err); done() },
			complete: () => {
				assertInvariants(service);
				assertAuthenticated(expectedResultingUserDetails);
				done()
			}
		});
		mockHttpAuthorizationSuccess(serverUserDetails, true);
	};

	it('handles server amending user name [A]', (done) => {
		const username: string = 'benedict';
		const password: string = 'letmein';
		const serverUserDetails: User = { username: 'Benedict', password: null, authorities: ['ROLE_ADMIN'] };
		testServerAmendingUsername(done, username, password, serverUserDetails);
	});

	it('handles server amending user name [B]', (done) => {
		const username: string = 'user1234';
		const password: string = 'password123';
		const serverUserDetails: User = { username: 'Allan', password: '0123456789', authorities: [] };
		testServerAmendingUsername(done, username, password, serverUserDetails);
	});
});
