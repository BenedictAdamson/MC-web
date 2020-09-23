import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { SelfComponent } from './self.component';

describe('SelfComponent', () => {
	let fixture: ComponentFixture<SelfComponent>;
	let component: SelfComponent;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			providers: [
			],
			declarations: [
				SelfComponent
			]
		}).compileComponents();
	}));
	beforeEach(() => {
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
			fixture.detectChanges();
			const element: HTMLElement = fixture.nativeElement;
			expect(element.textContent).toContain(component.username);
	})});
});