import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { SelfService } from './self.service';

describe('SelfService', () => {

	let getLoggedIn = function(service: SelfService): boolean {
		var loggedIn: boolean = null;
		service.loggedIn$.subscribe({
			next: (l) => loggedIn = l,
			error: (err) => fail(err),
			complete: () => { }
		});
		return loggedIn;
	};

	let getUsername = function(service: SelfService): string {
		var username: string = null;
		service.username$.subscribe({
			next: (u) => username = u,
			error: (err) => fail(err),
			complete: () => { }
		});
		return username;
	};

	let assertInvariants: CallableFunction = (s: SelfService) => {
		var loggedIn: boolean = getLoggedIn(s);
		var username: string = getUsername(s);
		expect(loggedIn).toBe(username != null, 'loggedIn iff username is non null.');
	};

	let service: SelfService;

	beforeEach(() => {
		service = new SelfService();
	});

	it('should be created with initial state', () => {
		expect(service).toBeTruthy();
		assertInvariants(service);
		expect(getLoggedIn(service)).toBe(false, 'not loggedIn');
	});

	let assertLoggedIn = function() {
		assertInvariants(service);
		var loggedIn: boolean = getLoggedIn(service);
		var username: string = getUsername(service);
		expect(username).not.toBe(null, 'username not null');
		expect(loggedIn).toBe(true, 'loggedIn');
	}

	it('should have username after successful login', (done) => {
		var nCalls: number = 0;
		service.login().subscribe({
			next: () => {
				assertLoggedIn();
				++nCalls;
				done();
			},
			error: (err) => done.fail(err),
			complete: () => {
				assertLoggedIn();
				nCalls ? {} : done();
			}
		});
	});
});
