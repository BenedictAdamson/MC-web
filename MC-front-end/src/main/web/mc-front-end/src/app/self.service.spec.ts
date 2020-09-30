import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';

import { SelfService } from './self.service';

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

    const USER_A = { username: 'Administrator', password: null, authorities: ['ROLE_ADMIN'] };
    const USER_B = { username: 'Benedict', password: null, authorities: [] };

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

	let assertAuthenticated = function() {
		assertInvariants(service);
		var authenticated: boolean = getAuthenticated(service);
		expect(service.username).not.toBe(null, 'username not null');
		expect(service.password).not.toBe(null, 'password not null');
		expect(authenticated).toBe(true, 'authenticated');
	}
});
