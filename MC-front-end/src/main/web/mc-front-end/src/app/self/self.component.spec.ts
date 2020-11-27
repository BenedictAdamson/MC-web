import { Observable, defer, of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SelfComponent } from './self.component';
import { SelfService } from '../self.service';
import { User } from '../user';

class MockSelfService {

	constructor(private self: User) { };

	get username(): string {
		return this.self ? this.self.username : null;
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

	let getAuthenticated = function(component: SelfComponent): boolean {
		var loggedIn: boolean = null;
		component.authenticated$.subscribe({
			next: (l) => loggedIn = l,
			error: (err) => fail(err),
			complete: () => { }
		});
		return loggedIn;
	};

	const USER_A: User = { id: new uuid(), username: 'Allan', password: 'letmein', authorities: ['ROLE_MANAGE_GAMES'] };
	const USER_B: User = { id: new uuid(), username: 'Benedict', password: 'password123', authorities: [] };

	const setup = function(self: User) {
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

	const assertInvariants = function() {
		expect(component).toBeDefined();
		const element: HTMLElement = fixture.nativeElement;
		const logoutButton: HTMLButtonElement = element.querySelector('button[id="logout"]');
		const selfElement = element.querySelector('#self');
		expect(logoutButton).withContext('logout button').not.toBeNull();
		expect(selfElement).withContext('self element').not.toBeNull();
	};

	const assertNotLoggedIn = function() {
		expect(getAuthenticated(component)).withContext('authenticated').toBeFalse();
		expect(component.username).withContext('username').toBeNull();
		const element: HTMLElement = fixture.nativeElement;
		const loginLink: HTMLAnchorElement = element.querySelector('a[id="login"]');
		const logoutButton: HTMLButtonElement = element.querySelector('button[id="logout"]');
		const selfElement = element.querySelector('#self');
		expect(loginLink).withContext('login link').not.toBeNull();
		expect(loginLink.textContent).withContext('login link text').toContain('Login');
		expect(logoutButton.disabled).withContext('logout button disabled').toBeTrue();
		expect(selfElement).withContext('self element').not.toBeNull();
		expect(selfElement.textContent).withContext('self element text').toMatch('[Nn]ot logged in');
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
		expect(component.username).withContext('username').toEqual(self.username);
		const element: HTMLElement = fixture.nativeElement;
		const loginLink: HTMLAnchorElement = element.querySelector('a[id="login"]');
		const logoutButton: HTMLButtonElement = element.querySelector('button[id="logout"]');
		const selfLink = element.querySelector('a[id="self"]');
		expect(loginLink).withContext('login link').toBeNull();
		expect(logoutButton.disabled).withContext('logout button disabled').toBeFalse();
		expect(selfLink.textContent).withContext('self link text').toEqual(self.username);
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