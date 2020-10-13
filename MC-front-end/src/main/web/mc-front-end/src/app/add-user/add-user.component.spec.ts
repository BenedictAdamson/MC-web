import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';

import { AddUserComponent } from './add-user.component';
import { UserService } from '../user.service';
import { User } from '../user';

class MockUserService {
	users: User[] = [];

	getUsers(): Observable<User[]> {
		return of(this.users);
	}

	getUser(username: string): Observable<User> {
		for (let user of this.users) {
			if (user.username == username) return of(user);
		}
		return of(null);
	}

	add(user: User): Observable<boolean> {
		for (let present of this.users) {
			if (present.username == user.username) return of(false);
		}
		this.users.push(user);
		return of(true);
	}
}

describe('AddUserComponent', () => {
	const USER_A: User = { username: 'Administrator', password: 'letmein', authorities: [] };
	const USER_B: User = { username: 'Benedict', password: 'pasword123', authorities: [] };

	let routerSpy;
	let userService: MockUserService;
	let fixture: ComponentFixture<AddUserComponent>;
	let component: AddUserComponent;

	beforeEach(waitForAsync(() => {
		routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
		routerSpy.navigateByUrl.and.returnValue(null);
		TestBed.configureTestingModule({
			imports: [],
			providers: [
				{ provide: Router, useValue: routerSpy },
				{ provide: UserService, useClass: MockUserService }
			],
			declarations: [AddUserComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		userService = TestBed.get(UserService);
		fixture = TestBed.createComponent(AddUserComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should create with empty password', () => {
		expect(component.password).toEqual('');
	});

	it('should create with rejected flag clear', () => {
		expect(component.rejected).toBeFalse();
	});

	it('should initilize to empty', () => {
		component.ngOnInit();

		expect(component.username).withContext('username').toEqual('');
		expect(component.password).withContext('password').toEqual('');
		expect(component.rejected).withContext('rejected').toBeFalse();
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


	const testAddFailure = function(user: User) {
		userService.users.push(user);// will fail because a duplicate username
		component.username = user.username;
		component.password = user.password;

		component.add();
		tick();
		fixture.detectChanges();

		expect(component.username).withContext('username').toEqual(user.username);
		expect(component.password).withContext('password').toEqual(user.password);
		expect(component.rejected).withContext('rejected').toBeTrue();
		expect(routerSpy.navigateByUrl.calls.count()).withContext('router.navigateByUrl calls').toEqual(0);
	};

	it('should handle addition failure [A]', fakeAsync(() => {
		testAddFailure(USER_A);
	}));

	it('should handle addition failure [B]', fakeAsync(() => {
		testAddFailure(USER_B);
	}));


	const testAddSuccess = function(userDetails: User) {
		component.username = userDetails.username;
		component.password = userDetails.password;

		component.add();
		tick();
		fixture.detectChanges();

		expect(component.rejected).withContext('rejected').toBeFalse();
		expect(routerSpy.navigateByUrl.calls.count()).withContext('router.navigateByUrl calls').toEqual(1);
		expect(routerSpy.navigateByUrl.calls.argsFor(0)).withContext('router.navigateByUrl args').toEqual(['/user']);
	};

	it('should handle addition success [A]', fakeAsync(() => {
		testAddSuccess(USER_A);
	}));

	it('should handle addition success [B]', fakeAsync(() => {
		testAddSuccess(USER_B);
	}));
});
