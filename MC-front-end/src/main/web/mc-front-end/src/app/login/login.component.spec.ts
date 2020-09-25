import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [LoginComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have a username field', () => {
		const element: HTMLElement = fixture.nativeElement;
		const field = element.querySelector('input[name="username"]');
		expect(field).not.toBeNull();
	});
});
