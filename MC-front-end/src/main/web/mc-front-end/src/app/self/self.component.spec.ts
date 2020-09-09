import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeycloakService } from 'keycloak-angular';

import { SelfComponent } from './self.component';

class MockKeycloakService {

	private loggedIn: boolean = false;
	private username: string = null;

	getUsername(): string { return this.username; }

	isLoggedIn(): Promise<boolean> { return Promise.resolve(this.loggedIn); }

	login(): Promise<void> {
		this.username = "jeff";
		this.loggedIn = true;
		return Promise.resolve();
	}
}

describe('SelfComponent', () => {
	let component: SelfComponent;
	let fixture: ComponentFixture<SelfComponent>;

	beforeEach(async () => {
		TestBed.configureTestingModule({
			// provide the component-under-test and dependent service
			providers: [
				SelfComponent,
				{ provide: KeycloakService, useClass: MockKeycloakService }
			]
		});
		TestBed.inject(KeycloakService);
		component = TestBed.inject(SelfComponent);
		fixture = TestBed.createComponent(SelfComponent);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeDefined();
	});

	it('should not initially be logged in', () => {
		expect(component.isLoggedIn()).toBeFalse();
		expect(component.getUsername()).toBeUndefined();
	});

	it('should have an identity after login', () => {
		component.login().then(
			() => {// fulfilled
				expect(component.isLoggedIn()).toBeFalse();
				expect(component.getUsername()).toBeUndefined();
			},
			(reason: any) => {// rejected
				fail(reason);
			});
	});

	it('should initially provide a login button', () => {
		const element: HTMLElement = fixture.nativeElement;
		const button = element.querySelector('button');
		expect(button).toBeDefined();
		expect(button.textContent).toContain('login');
	});

	it('should display user-name after login', () => {
		async () => component.login();
		const element: HTMLElement = fixture.nativeElement;
		const button = element.querySelector('button');
		expect(button).toBeUndefined();
		expect(element.textContent).toContain(component.getUsername());
	});
});