import { Observable, defer, of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SelfComponent } from './self.component';
import { SelfService } from '../service/self.service';
import { User } from '../user';

class MockSelfService {

	constructor(private self: User | null) { };

	get username$(): Observable<string | null> {
		return of(this.self ? this.self.username : null);
	}

	get authenticated$(): Observable<boolean> {
		return of(this.self != null);
	}

	logout(): Observable<null> {
		return defer(() => {
			this.self = null;
			return of(null)
		});
	}
}// class

describe('SelfComponent', () => {
	let fixture: ComponentFixture<SelfComponent>;
	let component: SelfComponent;

	let getAuthenticated = function(component: SelfComponent): boolean | null {
		var loggedIn: boolean | null = null;
		component.authenticated$.subscribe({
			next: (l) => loggedIn = l,
			error: (err) => fail(err),
			complete: () => { }
		});
		return loggedIn;
	};

	const USER_A: User = { id: uuid(), username: 'Allan', password: 'letmein', authorities: ['ROLE_MANAGE_GAMES'] };
	const USER_B: User = { id: uuid(), username: 'Benedict', password: 'password123', authorities: [] };

	const setup = function(self: User | null) {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			providers: [
				{ provide: SelfService, useFactory: () => { return new MockSelfService(self); } }],
			declarations: [
				SelfComponent
			]
		});

		fixture = TestBed.createComponent(SelfComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};

	const getUsername = function(component: SelfComponent): string | null {
		var username: string | null = null;
		component.username$.subscribe({
			next: (u) => username = u,
			error: (err) => fail(err),
			complete: () => { }
		});
		return username;
	};

	const assertInvariants = function() {
		expect(component).toBeDefined();
		const element: HTMLElement = fixture.nativeElement;
		const logoutButton: HTMLButtonElement | null = element.querySelector('button[id="logout"]');
		const selfElement = element.querySelector('#self');
		expect(logoutButton).withContext('logout button').not.toBeNull();
		expect(selfElement).withContext('self element').not.toBeNull();
	};

	const assertNotLoggedIn = function() {
		expect(getAuthenticated(component)).withContext('authenticated').toBeFalse();
		expect(getUsername(component)).withContext('username').toBeNull();

		const element: HTMLElement = fixture.nativeElement;
		const loginLink: HTMLAnchorElement | null = element.querySelector('a[id="login"]');
		const logoutButton: HTMLButtonElement | null = element.querySelector('button[id="logout"]');
		const selfElement = element.querySelector('#self');
		expect(loginLink).withContext('login link').not.toBeNull();
		expect(selfElement).withContext('self element').not.toBeNull();
		expect(logoutButton ? logoutButton.disabled : true).withContext('logout button disabled').toBeTrue();
		const loginLinkText: string | null = loginLink ? loginLink.textContent : null;
		expect(loginLinkText).withContext('login link text').toContain('Login');
		const selfElementText: string | null = selfElement ? selfElement.textContent : null;
		expect(selfElementText).withContext('self element text').toMatch('[Nn]ot logged in');
	};

	it('handles not logged-in case', () => {
		setup(null);
		assertInvariants();
		assertNotLoggedIn();
	});

	const testLoggedIn = function(self: User) {
		setup(self);
		assertInvariants();
		expect(getAuthenticated(component)).withContext('authenticated').toBeTrue();
		expect(getUsername(component)).withContext('username').toEqual(self.username);
		const element: HTMLElement = fixture.nativeElement;
		const loginLink: HTMLAnchorElement | null = element.querySelector('a[id="login"]');
		const logoutButton: HTMLButtonElement | null = element.querySelector('button[id="logout"]');
		const selfLink: HTMLAnchorElement | null = element.querySelector('a[id="self"]');
		expect(loginLink).withContext('login link').toBeNull();
		expect(logoutButton ? logoutButton.disabled : true).withContext('logout button disabled').toBeFalse();
		const selfLinkText: string | null = selfLink ? selfLink.textContent : null;
		expect(selfLinkText).withContext('self link text').toEqual(self.username);
	};

	it('handles logged-in case [A]', () => {
		testLoggedIn(USER_A);
	});

	it('handles logged-in case [B]', () => {
		testLoggedIn(USER_B);
	});

	it('handles logout', fakeAsync(() => {
		const self: User = USER_A;
		setup(self);

		component.logout();
		tick();
		fixture.detectChanges();

		assertInvariants();
		assertNotLoggedIn();
	}));

});