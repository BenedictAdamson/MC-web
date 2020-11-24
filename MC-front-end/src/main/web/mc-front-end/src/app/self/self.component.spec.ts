import { Observable, defer, of } from 'rxjs';

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

	get authorities$(): Observable<string[]> {
		return of(this.self ? this.self.authorities : []);
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

	const USER_A = { username: 'Allan', password: 'letmein', authorities: ['ROLE_MANAGE_GAMES'] };
	const USER_B = { username: 'Benedict', password: 'password123', authorities: [] };

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

	const assertNotLoggedIn = function() {
		expect(getAuthenticated(component)).withContext('authenticated').toBeFalse();
		expect(component.username).withContext('username').toBeNull();
		const element: HTMLElement = fixture.nativeElement;
		const loginLink = element.querySelector('a[id="login"]');
		const logoutButton = element.querySelector('button[id="logout"]');
		expect(loginLink).withContext('login link').not.toBeNull();
		expect(loginLink.textContent).withContext('login link text').toContain('Login');
		expect(logoutButton).withContext('logout button').toBeNull();
	};

	it('handles not logged-in case', () => {
		setup(null);
		expect(component).toBeDefined();
		assertNotLoggedIn();
	});

	const testLoggedIn = function(self: User) {
		setup(self);
		expect(component).toBeDefined();
		expect(getAuthenticated(component)).withContext('authenticated').toBeTrue();
		expect(component.username).withContext('username').toEqual(self.username);
		const element: HTMLElement = fixture.nativeElement;
		const loginLink = element.querySelector('a[id="login"]');
		const logoutButton = element.querySelector('button[id="logout"]');
		expect(loginLink).withContext('login link').toBeNull();
		expect(logoutButton).withContext('logout button').not.toBeNull();
		expect(logoutButton.textContent).withContext('logout button link text').toContain('Logout');
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

		assertNotLoggedIn();
	}));

});