import { TestBed } from '@angular/core/testing';

import { SelfService } from './self.service';

describe('SelfService', () => {

	let assertInvariants: CallableFunction = (s: SelfService) => {
		expect(s.isLoggedIn()).toBe(s.getUsername() != null, 'isLoggedIn() iff getUsername() is non null.');
	};

	let service: SelfService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(SelfService);
	});

	it('should be created with iniitail state', () => {
		expect(service).toBeTruthy();
		assertInvariants(service);
		expect(service.isLoggedIn()).toBe(false, 'not loggedIn');
	});
});
