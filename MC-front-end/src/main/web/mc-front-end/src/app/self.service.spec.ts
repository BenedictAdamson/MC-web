import { Injectable } from '@angular/core';
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

	let service: SelfService;

	beforeEach(() => {
		service = new SelfService();
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
