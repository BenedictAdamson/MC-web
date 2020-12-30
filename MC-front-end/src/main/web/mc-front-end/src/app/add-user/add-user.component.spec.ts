import { Router } from '@angular/router';
import { v4 as uuid } from 'uuid';

import { FormsModule } from '@angular/forms';

import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';

import { AbstractUserService } from '../service/abstract.user.service';
import { AddUserComponent } from './add-user.component';
import { MockUserService } from '../service/mock/mock.user.service';
import { UserDetails } from '../user-details';
import { User } from '../user';

describe('AddUserComponent', () => {
	const USER_DETAILS_A: UserDetails = { username: 'Administrator', password: 'letmein', authorities: [] };
	const USER_DETAILS_B: UserDetails = { username: 'Benedict', password: 'pasword123', authorities: [] };
	const USER_A: User = new User(uuid(), USER_DETAILS_A);
	const USER_B: User = new User(uuid(), USER_DETAILS_B);

	let routerSpy: any;
	let userService: MockUserService;
	let fixture: ComponentFixture<AddUserComponent>;
	let component: AddUserComponent;

	const setUp = function(users0: User[]) {
		routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
		routerSpy.navigateByUrl.and.returnValue(null);

		userService = new MockUserService(users0);
		TestBed.configureTestingModule({
			imports: [FormsModule],
			providers: [
				{ provide: Router, useValue: routerSpy },
				{ provide: AbstractUserService, useValue: userService }
			],
			declarations: [AddUserComponent]
		})
			.compileComponents();
		fixture = TestBed.createComponent(AddUserComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};

	it('can be created', () => {
		setUp([]);
		expect(component).toBeTruthy();
		expect(component.userDetails.username).withContext('username').toEqual('');
		expect(component.userDetails.password).withContext('password').toEqual('');
		expect(component.rejected).withContext('rejected').toBeFalse();

		const element: HTMLElement = fixture.nativeElement;
		const usernameElement: HTMLInputElement | null = element.querySelector('input[name="username"]');
		const passwordElement: HTMLInputElement | null = element.querySelector('input[name="password"]');
		const submitButton: HTMLButtonElement | null = element.querySelector('button[type="submit"]');
		expect(usernameElement).withContext('username element').not.toBeNull();
		expect(passwordElement).not.toBeNull('password element');
		expect(submitButton).withContext('submit button').not.toBeNull();
		if (passwordElement) {
			expect(passwordElement.getAttribute('type')).withContext('password element type').toBe('password',);
		}
	});


	const testAddFailure = function(user: User) {
		setUp([user]); // will fail because a duplicate username
		component.userDetails = new UserDetails(user);

		component.add();
		tick();
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
		setUp([]);
		component.userDetails = userDetails;

		component.add();
		tick();
		fixture.detectChanges();

		expect(component.rejected).withContext('rejected').toBeFalse();
		expect(routerSpy.navigateByUrl.calls.count()).withContext('router.navigateByUrl calls').toEqual(1);
		expect(routerSpy.navigateByUrl.calls.argsFor(0)).withContext('router.navigateByUrl args').toEqual(['/user']);

		userService.getUsers().subscribe(users => {
			expect(users.length).withContext('users length').toEqual(1);
			const addedUser: User = users[0];
			expect(addedUser.username).withContext('added username').toEqual(userDetails.username);
			expect(addedUser.password).withContext('added password').toEqual(userDetails.password);
			expect(addedUser.authorities).withContext('added authorities').toEqual([]);
		});
		tick();
	};

	it('should handle addition success [A]', fakeAsync(() => {
		testAddSuccess(USER_A);
	}));

	it('should handle addition success [B]', fakeAsync(() => {
		testAddSuccess(USER_B);
	}));
});
