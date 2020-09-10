import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KeycloakService } from 'keycloak-angular';

import { SelfComponent } from './self.component';

class MockKeycloakService {

	private loggedIn: boolean = false;
	private username: string = null;

	getUsername(): string { return this.username; }

	async isLoggedIn(): Promise<boolean> { return Promise.resolve(this.loggedIn); }

	async login(): Promise<void> {
		this.loggedIn = true;
		this.username = "jeff";
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
		fixture.detectChanges();
		expect(await component.isLoggedIn()).toBeTrue();
		expect(component.getUsername()).toBeDefined();
	});
	
	it('should initially provide a login button', () => {
		const element: HTMLElement = fixture.nativeElement;
		const button = element.querySelector('button');
		expect(button).not.toBeNull();
		expect(button.textContent).toContain('login');
	});

	it('should display user-name after login', async () => {
		await component.login();
		fixture.detectChanges();
		const element: HTMLElement = fixture.nativeElement;
		const button = element.querySelector('button');
		expect(button).toBeNull();
		expect(element.textContent).toContain(component.getUsername());
	});
});