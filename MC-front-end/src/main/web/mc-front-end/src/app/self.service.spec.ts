import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

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
		expect(authenticated && s.username == null).toEqual(false, 'Not authenticated if username is null');
		expect(authenticated && s.password == null).toEqual(false, 'Not authenticated if password is null');
		expect(!authenticated && 0 < authorities.length).toEqual(false, 'A user that has not been authenticated has no authorities');
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

	it('should be created with initial state', () => {
		expect(service).toBeTruthy();
		assertInvariants(service);
		expect(service.username).toBe(null, 'null username');
		expect(service.password).toBe(null, 'null password');
		expect(getAuthenticated(service)).toBe(false, 'not authenticated');
	});

	let mockHttpAuthorizationFailure = () => {
		const request = httpTestingController.expectOne('/api/self');
		expect(request.request.method).toEqual('GET');
		expect(request.request.headers.has("Authorization")).toEqual(true, 'has Authorization header');
		request.flush("", { headers: new HttpHeaders(), status: 401, statusText: 'Unauthorized' });
		httpTestingController.verify();
	};

	it('should request server for authentication', (done) => {
		service.authenticate("user", "password").subscribe({
			next: () => { },
			error: (err) => { fail(err); done() },
			complete: () => {
				assertInvariants(service);
				done()
			}
		});
		mockHttpAuthorizationFailure();
	});


	let testAuthenticationFailure = (done, username: string, password: string) => {
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
		mockHttpAuthorizationFailure();
	};

	it('should handle authentication failure [A]', (done) => {
		testAuthenticationFailure(done, USER_A.username, USER_A.password);
	});

	it('should handle authentication failure [B]', (done) => {
		testAuthenticationFailure(done, USER_B.username, USER_B.password);
	});

	let mockHttpAuthorizationSuccess = function(userDetails: User) {
		const request = httpTestingController.expectOne('/api/self');
		expect(request.request.method).toEqual('GET');
		expect(request.request.headers.has("Authorization")).toEqual(true, 'has Authorization header');
		request.flush(userDetails, { headers: new HttpHeaders(), status: 200, statusText: 'Ok' });
		httpTestingController.verify();
	};

	let assertAuthenticated = function(userDetails: User) {
		var authenticated: boolean = getAuthenticated(service);
		var authorities: string[] = getAuthorities(service);
		expect(service.username).toEqual(userDetails.username, 'username');
		expect(service.password).toEqual(userDetails.password, 'password');
		expect(authorities).toEqual(userDetails.authorities, 'authorities');
		expect(authenticated).toEqual(true, 'authenticated');
	}




	let testAuthenticationSuccess = (done, userDetails: User) => {
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
		mockHttpAuthorizationSuccess(userDetails);
	};

	it('should handle authentication success [A]', (done) => {
		testAuthenticationSuccess(done, USER_A);
	});

	it('should handle authentication success [B]', (done) => {
		testAuthenticationSuccess(done, USER_B);
	});
});
