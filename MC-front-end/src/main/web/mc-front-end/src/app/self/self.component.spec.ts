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
	});

	it('should create', () => {
		expect(component).toBeDefined();
	});

	it('should not initially be logged in', async () => {
		expect(await component.isLoggedIn()).toBeFalse();
		expect(component.getUsername()).toBeNull();
	});

	it('should have an identity after login', async () => {
		await component.login();
		expect(await component.isLoggedIn()).toBeTrue();
		expect(component.getUsername()).toBeDefined();
	});
});