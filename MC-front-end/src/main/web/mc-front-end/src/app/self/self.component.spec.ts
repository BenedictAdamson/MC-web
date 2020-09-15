import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KeycloakService, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import { Subject } from 'rxjs';

import { SelfComponent } from './self.component';

class MockKeycloakService {

	keycloakEvents$: Subject<KeycloakEvent> = new Subject;

	private username: string = null;
	private nextUsername: string = "jeff";

	getUsername(): string { return this.username; }

	async isLoggedIn(): Promise<boolean> { return Promise.resolve(this.username != null); }

	async login(options: any): Promise<void> {
		return new Promise((resolve, reject) => {
			this.username = this.nextUsername;
			this.nextUsername = null;
			this.keycloakEvents$.next({
				type: KeycloakEventType.OnAuthSuccess
			});
			resolve();
		});
	}
}

describe('SelfComponent', () => {
	let fixture: ComponentFixture<SelfComponent>;
	let component: SelfComponent;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: KeycloakService, useClass: MockKeycloakService }
			],
			declarations: [
				SelfComponent
			]
		}).compileComponents();
	}));
	beforeEach(() => {
		TestBed.inject(KeycloakService);
		fixture = TestBed.createComponent(SelfComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		expect(component).toBeDefined();
	});

	it('should not initially be logged in', async () => {
		expect(component.loggedIn).toBeFalse();
		expect(component.username).toBeNull();
	});

	it('should have an identity after login', async () => {
		component.login().subscribe(() => {
			component.handleLoggedIn();
			fixture.detectChanges();
			expect(component.loggedIn).toBe(true, 'logged in');
			expect(component.username).not.toBe(null, 'has username');
	})});

	it('should initially provide a login button', () => {
		fixture.detectChanges();
		const element: HTMLElement = fixture.nativeElement;
		const button = element.querySelector('button');
		expect(button).not.toBeNull();
		expect(button.textContent).toContain('login');
	});

	it('should display user-name after login', async () => {
		component.login().subscribe(() => {
			component.handleLoggedIn();
			fixture.detectChanges();
			const element: HTMLElement = fixture.nativeElement;
			expect(element.textContent).toContain(component.username);
	})});
});