import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { LoginComponent } from './login.component';
import { SelfService } from '../self.service';

describe('LoginComponent', () => {
	let httpClient: HttpClient;
	let httpTestingController: HttpTestingController;
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [
				{ provide: SelfService, useClass: SelfService }
			],
			declarations: [LoginComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
        /* Inject for each test:
         * HTTP requests will be handled by the mock back-end.
          */
		httpClient = TestBed.get(HttpClient);
		httpTestingController = TestBed.get(HttpTestingController);
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

	it('should have a password field', () => {
		const element: HTMLElement = fixture.nativeElement;
		const field = element.querySelector('input[name="password"]');
		expect(field).not.toBeNull('has <input name="password">');
		expect(field.getAttribute('type')).toBe('password', '<input name="password"> is type="password"');
	});

	it('should have a submit button', () => {
		const element: HTMLElement = fixture.nativeElement;
		const field = element.querySelector('button[type="submit"]');
		expect(field).not.toBeNull('has <button type="submit">');
	});
});
