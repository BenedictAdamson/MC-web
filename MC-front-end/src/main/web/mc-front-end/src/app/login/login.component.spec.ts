import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { LoginComponent } from './login.component';
import { SelfService } from '../self.service';

describe('LoginComponent', () => {
	const USER_A = { username: 'Administrator', password: 'letmein', authorities: ['ROLE_ADMIN'] };
	const USER_B = { username: 'Benedict', password: 'pasword123', authorities: [] };

	let httpClient: HttpClient;
	let httpTestingController: HttpTestingController;
	let selfService: SelfService;
	let fixture: ComponentFixture<LoginComponent>;
	let component: LoginComponent;

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
		selfService = TestBed.get(SelfService);
		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should create with null password', () => {
		expect(component.password).toBeNull();
	});

	const testNgOnInit = function() {
		component.ngOnInit()
		expect(component.username).toEqual(selfService.username, 'username');
		expect(component.password).toEqual(selfService.password, 'password');
	}

	it('should initilize from the service [null]', () => {
		testNgOnInit();
	});

	const testNgOnInitAlreadyLoggedIn = function(done, userDetails) {
		selfService.authenticate(userDetails.username, userDetails.password).subscribe({
			next: () => { },
			error: (err) => { fail(err); done() },
			complete: () => {
				testNgOnInit();
				done()
			}
		});
		const request = httpTestingController.expectOne('/api/self');
		expect(request.request.method).toEqual('GET');
		expect(request.request.headers.has("Authorization")).toEqual(true, 'has Authorization header');
		request.flush(userDetails, { headers: new HttpHeaders(), status: 200, statusText: 'Ok' });
		httpTestingController.verify();
	}

	it('should initilize from the service [A]', (done) => {
		testNgOnInitAlreadyLoggedIn(done, USER_A);
	});

	it('should initilize from the service [B]', (done) => {
		testNgOnInitAlreadyLoggedIn(done, USER_B);
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
