import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { FormsModule } from '@angular/forms';

import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';

import { AddUserComponent } from './add-user.component';
import { UserDetails } from '../user-details';
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

	add(userDetails: UserDetails): Observable<User> {
		for (let present of this.users) {
			if (present.username == userDetails.username) return of(null);
		}
		const user: User = new User(userDetails);
		this.users.push(user);
		return of(user);
	}
}

describe('AddUserComponent', () => {
	const USER_DETAILS_A: UserDetails = { username: 'Administrator', password: 'letmein', authorities: [] };
	const USER_DETAILS_B: UserDetails = { username: 'Benedict', password: 'pasword123', authorities: [] };
	const USER_A: User = new User(USER_DETAILS_A);
	const USER_B: User = new User(USER_DETAILS_B);

	let routerSpy: any;
	let userService: MockUserService;
	let fixture: ComponentFixture<AddUserComponent>;
	let component: AddUserComponent;

	beforeEach(waitForAsync(() => {
		routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
		routerSpy.navigateByUrl.and.returnValue(null);
		TestBed.configureTestingModule({
			imports: [FormsModule],
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

	it('can be created', () => {
		expect(component).toBeTruthy();
		expect(component.userDetails.username).withContext('username').toEqual('');
		expect(component.userDetails.password).withContext('password').toEqual('');
		expect(component.rejected).withContext('rejected').toBeFalse();

		const element: HTMLElement = fixture.nativeElement;
		const usernameElement: HTMLInputElement = element.querySelector('input[name="username"]');
		const passwordElement: HTMLInputElement = element.querySelector('input[name="password"]');
		const submitButton: HTMLButtonElement = element.querySelector('button[type="submit"]');
		expect(usernameElement).withContext('username element').not.toBeNull();
		expect(passwordElement).not.toBeNull('password element');
		expect(passwordElement.getAttribute('type')).withContext('password element type').toBe('password',);
		expect(submitButton).withContext('submit button').not.toBeNull();
	});


	const testAddFailure = function(user: User) {
		userService.users.push(user);// will fail because a duplicate username
		component.userDetails = new UserDetails(user);

		component.add();
		tick();
		fixture.detectChanges();

		expect(component.userDetails.username).withContext('username').toEqual(user.username);
		expect(component.userDetails.password).withContext('password').toEqual(user.password);
		expect(component.rejected).withContext('rejected').toBeTrue();
		expect(routerSpy.navigateByUrl.calls.count()).withContext('router.navigateByUrl calls').toEqual(0);
	};

	it('should handle addition failure [A]', fakeAsync(() => {
		testAddFailure(USER_A);
	}));

	it('should handle addition failure [B]', fakeAsync(() => {
		testAddFailure(USER_B);
	}));


	const testAddSuccess = function(userDetails: UserDetails) {
		component.userDetails = userDetails;

		component.add();
		tick();
		fixture.detectChanges();

		expect(component.rejected).withContext('rejected').toBeFalse();
		expect(routerSpy.navigateByUrl.calls.count()).withContext('router.navigateByUrl calls').toEqual(1);
		expect(routerSpy.navigateByUrl.calls.argsFor(0)).withContext('router.navigateByUrl args').toEqual(['/user']);
		const addedUser: User = userService.users[userService.users.length - 1];
		expect(addedUser.username).withContext('added username').toEqual(userDetails.username);
		expect(addedUser.password).withContext('added password').toEqual(userDetails.password);
		expect(addedUser.authorities).withContext('added authorities').toEqual([]);
	};

	it('should handle addition success [A]', fakeAsync(() => {
		testAddSuccess(USER_A);
	}));

	it('should handle addition success [B]', fakeAsync(() => {
		testAddSuccess(USER_B);
	}));
});
