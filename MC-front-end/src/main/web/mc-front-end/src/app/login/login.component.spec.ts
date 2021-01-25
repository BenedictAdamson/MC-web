import { v4 as uuid } from 'uuid';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AbstractSelfService } from '../service/abstract.self.service';
import { LoginComponent } from './login.component';
import { SelfService } from '../service/self.service';
import { User } from '../user';

describe('LoginComponent', () => {
	const USER_A: User = { id: uuid(), username: 'Administrator', password: 'letmein', authorities: ['ROLE_ADMIN'] };
	const USER_B: User = { id: uuid(), username: 'Benedict', password: 'pasword123', authorities: [] };

	let routerSpy: any;
	let httpTestingController: HttpTestingController;
	let selfService: AbstractSelfService;
	let fixture: ComponentFixture<LoginComponent>;
	let component: LoginComponent;

	beforeEach(waitForAsync(() => {
		routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
		routerSpy.navigateByUrl.and.returnValue(null);
		TestBed.configureTestingModule({
			imports: [FormsModule, HttpClientTestingModule],
			providers: [
				{ provide: Router, useValue: routerSpy },
				{ provide: AbstractSelfService, useClass: SelfService }
			],
			declarations: [LoginComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		/* Inject for each test:
		 * HTTP requests will be handled by the mock back-end.
		  */
		TestBed.inject(HttpClient);
		httpTestingController = TestBed.inject(HttpTestingController);
		selfService = TestBed.inject(AbstractSelfService);
		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should create with null password', () => {
		expect(component.password).toEqual('');
	});

	it('should create with rejected flag clear', () => {
		expect(component.rejected).toBeFalse();
	});

	const testNgOnInit = function() {
		component.ngOnInit();
		expect(component.rejected).withContext('rejected').toBeFalse();
	}

	it('should initilize from the service [null]', () => {
		testNgOnInit();

		expect(component.username).withContext('username').toEqual('');
		expect(component.password).withContext('password').toEqual('');
	});

	const mockAuthenticationSuccess = function(userDetails: User) {
		const request = httpTestingController.expectOne('/api/self');
		expect(request.request.method).toEqual('GET');
		request.flush(userDetails, { headers: new HttpHeaders(), status: 200, statusText: 'Ok' });
		httpTestingController.verify();
	}

	const testNgOnInitAlreadyLoggedIn = function(done: any, userDetails: User) {
		if (!userDetails.password) throw new Error('null userDetails.password');

		selfService.authenticate(userDetails.username, userDetails.password).subscribe({
			next: () => { },
			error: (err) => { fail(err); done() },
			complete: () => {
				testNgOnInit();
				done();
			}
		});
		mockAuthenticationSuccess(userDetails);

		expect(component.username).withContext('username').toEqual(userDetails.username);
		expect(component.password).withContext('password').toEqual(userDetails.password);
	}

	it('should initialize from the service [A]', (done) => {
		testNgOnInitAlreadyLoggedIn(done, USER_A);
	});

	it('should initialize from the service [B]', (done) => {
		testNgOnInitAlreadyLoggedIn(done, USER_B);
	});

	it('should have a username field', () => {
		const element: HTMLElement = fixture.nativeElement;
		const field = element.querySelector('input[name="username"]');
		expect(field).not.toBeNull();
	});

	it('should have a password field', () => {
		const element: HTMLElement = fixture.nativeElement;
		const field: HTMLElement | null = element.querySelector('input[name="password"]');
		expect(field).not.toBeNull('has <input name="password">');
		if (field) {
			expect(field.getAttribute('type')).toBe('password', '<input name="password"> is type="password"');
		}
	});

	it('should have a submit button', () => {
		const element: HTMLElement = fixture.nativeElement;
		const field = element.querySelector('button[type="submit"]');
		expect(field).not.toBeNull('has <button type="submit">');
	});

	let mockHttpAuthorizationFailure = () => {
		const request = httpTestingController.expectOne('/api/self');
		expect(request.request.method).toEqual('GET');
		expect(request.request.headers.has("Authorization")).toEqual(true, 'has Authorization header');
		request.flush("", { headers: new HttpHeaders(), status: 401, statusText: 'Unauthorized' });
		httpTestingController.verify();
	};


	const testLoginFailure = function(done: any, userDetails: User) {
		if (!userDetails.password) throw new Error('null userDetails.password');

		component.username = userDetails.username;
		component.password = userDetails.password;
		component.login();
		mockHttpAuthorizationFailure();
		expect(component.username).withContext('username').toEqual(userDetails.username);
		expect(component.password).withContext('password').toEqual(userDetails.password);
		expect(component.rejected).withContext('rejected').toBeTrue();
		expect(routerSpy.navigateByUrl.calls.count()).withContext('router.navigateByUrl calls').toEqual(0);
		done()
	};

	it('should handle login failure [A]', (done) => {
		testLoginFailure(done, USER_A);
	});

	it('should handle login failure [B]', (done) => {
		testLoginFailure(done, USER_B);
	});


	const testLoginSuccess = function(done: any, userDetails: User) {
		if (!userDetails.password) throw new Error('null userDetails.password');

		component.username = userDetails.username;
		component.password = userDetails.password;
		component.login();
		mockAuthenticationSuccess(userDetails);
		expect(component.username).withContext('username').toEqual(userDetails.username);
		expect(component.password).withContext('password').toEqual(userDetails.password);
		expect(component.rejected).withContext('rejected').toBeFalse();
		expect(routerSpy.navigateByUrl.calls.count()).withContext('router.navigateByUrl calls').toEqual(1);
		expect(routerSpy.navigateByUrl.calls.argsFor(0)).withContext('router.navigateByUrl args').toEqual(['/']);
		done()
	};

	it('should handle login success [A]', (done) => {
		testLoginSuccess(done, USER_A);
	});

	it('should handle login success [B]', (done) => {
		testLoginSuccess(done, USER_B);
	});
});
