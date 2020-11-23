import { Observable, of } from 'rxjs';

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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

	it('handles not logged-in case', () => {
		setup(null);
		expect(component).toBeDefined();
		expect(getAuthenticated(component)).toBe(false, 'not authenticated');
		expect(component.username).withContext('username').toBeNull();
		const element: HTMLElement = fixture.nativeElement;
		const loginLink = element.querySelector('a[id="login"]');
		expect(loginLink).withContext('login link').not.toBeNull();
		expect(loginLink.textContent).withContext('login link text').toContain('login');
	});

});