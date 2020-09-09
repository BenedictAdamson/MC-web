import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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
		fixture.detectChanges();
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