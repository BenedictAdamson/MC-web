import { v4 as uuid } from 'uuid';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';

import { SelfService } from './self.service';
import { User } from '../user';

describe('SelfService', () => {

	const getAuthenticated = function(service: SelfService): boolean | null {
		var authenticated: boolean | null = null;
		service.authenticated$.subscribe({
			next: (a) => authenticated = a,
			error: (err) => fail(err),
			complete: () => { }
		});
		return authenticated;
	};

	const mayManageGames = function(service: SelfService): boolean | null {
		var may: boolean | null = null;
		service.mayManageGames$.subscribe({
			next: (m) => may = m,
			error: (err) => fail(err),
			complete: () => { }
		});
		return may;
	};

	const mayPlay = function(service: SelfService): boolean | null {
		var may: boolean | null = null;
		service.mayPlay$.subscribe({
			next: (m) => may = m,
			error: (err) => fail(err),
			complete: () => { }
		});
		return may;
	};

	const mayManageUsers = function(service: SelfService): boolean | null {
		var may: boolean | null = null;
		service.mayManageUsers$.subscribe({
			next: (m) => may = m,
			error: (err) => fail(err),
			complete: () => { }
		});
		return may;
	};

	const mayListUsers = function(service: SelfService): boolean | null {
		var may: boolean | null = null;
		service.mayListUsers$.subscribe({
			next: (m) => may = m,
			error: (err) => fail(err),
			complete: () => { }
		});
		return may;
	};

	const getUsername = function(service: SelfService): string | null {
		var username: string | null = null;
		service.username$.subscribe({
			next: (u) => username = u,
			error: (err) => fail(err),
			complete: () => { }
		});
		return username;
	};

	const getPassword = function(service: SelfService): string | null {
		var password: string | null = null;
		service.password$.subscribe({
			next: (p) => password = p,
			error: (err) => fail(err),
			complete: () => { }
		});
		return password;
	};

	const getId = function(service: SelfService): string | null {
		var id: string | null = null;
		service.id$.subscribe({
			next: (i) => id = i,
			error: (err) => fail(err),
			complete: () => { }
		});
		return id;
	};

	const assertInvariants: CallableFunction = (s: SelfService) => {
		const authenticated: boolean | null = getAuthenticated(s);
		const username: string | null = getUsername(s);
		const manageGames: boolean | null = mayManageGames(s);
		const play: boolean | null = mayPlay(s);
		const manageUsers: boolean | null = mayManageUsers(s);
		const listUsers: boolean | null = mayListUsers(s);
		const anyAuthority = manageGames || play || manageUsers || listUsers;

		expect(authenticated && username == null).withContext('Not authenticated if username is null').toEqual(false);
		expect(!authenticated && anyAuthority).withContext('A user that has not been authenticated has no authorities').toEqual(false);
	};

	const USER_A: User = { id: uuid(), username: 'Administrator', password: 'letmein', authorities: ['ROLE_ADMIN'] };
	const USER_B: User = { id: uuid(), username: 'Benedict', password: 'pasword123', authorities: [] };

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


	const assertNotAuthenticated = function() {
		const authenticated: boolean | null = getAuthenticated(service);
		expect(getUsername(service)).withContext('username').toBeNull();
		expect(getPassword(service)).withContext('password').toBeNull();
		expect(authenticated).withContext('authenticated').toEqual(false);
		expect(getId(service)).withContext('id').toBeNull();
	}

	it('constructs the initial state', () => {
		expect(service).toBeTruthy();
		assertInvariants(service);
		assertNotAuthenticated();
	});

	const expectAuthorizationRequestHeaders = function(expectAuthorizationHeader: boolean): TestRequest {
		const request: TestRequest = httpTestingController.expectOne('/api/self');
		expect(request.request.method).toEqual('GET');
		expect(request.request.headers.get("X-Requested-With")).withContext('X-Requested-With header').toEqual('XMLHttpRequest');
		expect(request.request.headers.has("Authorization")).withContext('has Authorization header').toEqual(expectAuthorizationHeader);
		return request;
	};

	const mockHttpAuthorizationFailure = function(expectAuthorizationHeader: boolean) {
		const request = expectAuthorizationRequestHeaders(expectAuthorizationHeader);
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


	const testAuthenticationFailure = function(done: any, username: string, password: string) {
		service.authenticate(username, password).subscribe({
			next: (success) => {
				expect(success).withContext('success').toBeFalse();
			},
			error: (err) => { fail(err); done() },
			complete: () => {
				assertInvariants(service);
				expect(getAuthenticated(service)).toEqual(false, 'not authenticated');
				expect(getUsername(service)).withContext('username').toBeNull();
				expect(getPassword(service)).withContext('password').toBeNull();
				expect(getId(service)).withContext('id').toBeNull();
				done()
			}
		});
		mockHttpAuthorizationFailure(true);
	};

	it('handles authentication failure [A]', (done) => {
		if (!USER_A.password) throw new Error('invalid test fixture');
		testAuthenticationFailure(done, USER_A.username, USER_A.password);
	});

	it('handles authentication failure [B]', (done) => {
		if (!USER_B.password) throw new Error('invalid test fixture');
		testAuthenticationFailure(done, USER_B.username, USER_B.password);
	});

	const mockHttpAuthorizationSuccess = function(user: User, expectAuthorizationHeader: boolean) {
		const request = expectAuthorizationRequestHeaders(expectAuthorizationHeader);
		request.flush(user);
		httpTestingController.verify();
	};

	const assertAuthenticated = function(user: User) {
		expect(getUsername(service)).withContext('username').toEqual(user.username);
		expect(getPassword(service)).withContext('password').toEqual(user.password);
		expect(getId(service)).withContext('id').toBe(user.id);
		expect(getAuthenticated(service)).withContext('authenticated').toEqual(true, 'authenticated');
	}

	const testAuthenticationSuccess = function(done: any, user: User) {
		service.authenticate(user.username, user.password).subscribe({
			next: (success) => {
				expect(success).withContext('success').toBeTrue();
			},
			error: (err) => { fail(err); done() },
			complete: () => {
				assertInvariants(service);
				assertAuthenticated(user);
				done()
			}
		});
		mockHttpAuthorizationSuccess(user, true);
	};

	it('handles authentication success [A]', (done) => {
		testAuthenticationSuccess(done, USER_A);
	});

	it('handles authentication success [B]', (done) => {
		testAuthenticationSuccess(done, USER_B);
	});

	const testAuthenticationSuccessForUserWithRole = function(done: any, role: string, expectManageGames: boolean, expectPlay: boolean, expectManageUsers: boolean, expectListUsers: boolean) {
		const user: User = { id: uuid(), username: 'Administrator', password: 'letmein', authorities: [role] };

		testAuthenticationSuccess(done, user);

		const manageGames: boolean | null = mayManageGames(service);
		const play: boolean | null = mayPlay(service);
		const manageUsers: boolean | null = mayManageUsers(service);
		const listUsers: boolean | null = mayListUsers(service);
		expect(manageGames).withContext('manageGames').toBe(expectManageGames);
		expect(play).withContext('play').toBe(expectPlay);
		expect(manageUsers).withContext('manageUsers').toBe(expectManageUsers);
		expect(listUsers).withContext('listUsers').toBe(expectListUsers);
	};

	it('handles authentication success for user with role [ROLE_MANAGE_GAMES]', (done) => {
		testAuthenticationSuccessForUserWithRole(done, 'ROLE_MANAGE_GAMES', true, false, false, false);
	});

	it('handles authentication success for user with role [ROLE_MANAGE_USERS]', (done) => {
		testAuthenticationSuccessForUserWithRole(done, 'ROLE_MANAGE_USERS', false, false, true, true);
	});

	it('handles authentication success for user with role [ROLE_PLAYER]', (done) => {
		testAuthenticationSuccessForUserWithRole(done, 'ROLE_PLAYER', false, true, false, true);
	});

	const mockHttpLogout = function() {
		const request: TestRequest = httpTestingController.expectOne('/logout');
		expect(request.request.method).toEqual('POST');
		request.flush(null, { headers: new HttpHeaders(), status: 204, statusText: 'No Content' });
	};

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

		mockHttpLogout();
		httpTestingController.verify();
	}

	it('handles logout from the initial state', (done) => {
		testLogout(done);
	});

	it('handles logout while authenticated', (done) => {
		const user: User = USER_A;
		service.authenticate(user.username, user.password).subscribe({
			next: () => { },
			error: (err) => { fail(err); done() },
			complete: () => {
				testLogout(done);
			}
		});
		mockHttpAuthorizationSuccess(user, true);
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




	const checkForCurrentAuthenticationWithSesson = function(done: any, serverUser: User) {
		const expectedFinalUserDetails: User = { id: serverUser.id, username: serverUser.username, password: null, authorities: serverUser.authorities };
		service.checkForCurrentAuthentication().subscribe({
			next: () => { },
			error: (err) => { fail(err); done() },
			complete: () => {
				assertInvariants(service);
				assertAuthenticated(expectedFinalUserDetails);
				done();
			}
		});
		mockHttpAuthorizationSuccess(serverUser, false);
	}

	const setUpAuthenticated = function(user: User) {
		service.setUser(user, true);
	};


	const testCheckForCurrentAuthenticationWithSesson = function(done: any, user: User) {
		setUpAuthenticated(user);
		checkForCurrentAuthenticationWithSesson(done, user);
	}


	it('handles check for current authentication while authenticated [A]', (done) => {
		testCheckForCurrentAuthenticationWithSesson(done, USER_A);
	});

	it('handles check for current authentication while authenticated [B]', (done) => {
		testCheckForCurrentAuthenticationWithSesson(done, USER_B);
	});



	const testServerAmendingUsername = function(done: any, username: string, password: string, serverUser: User) {
		const expectedResultingUserDetails: User = {
			id: serverUser.id,
			username: serverUser.username,
			password: password,// the server will probably resturn null or the encrypted password
			authorities: serverUser.authorities
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
		mockHttpAuthorizationSuccess(serverUser, true);
	};

	it('handles server amending user name [A]', (done) => {
		const username: string = 'benedict';
		const password: string = 'letmein';
		const serverUser: User = { id: uuid(), username: 'Benedict', password: null, authorities: ['ROLE_ADMIN'] };
		testServerAmendingUsername(done, username, password, serverUser);
	});

	it('handles server amending user name [B]', (done) => {
		const username: string = 'user1234';
		const password: string = 'password123';
		const serverUser: User = { id: uuid(), username: 'Allan', password: '0123456789', authorities: [] };
		testServerAmendingUsername(done, username, password, serverUser);
	});
});
