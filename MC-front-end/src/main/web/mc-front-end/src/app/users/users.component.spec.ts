import { Observable, of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SelfService } from '../self.service';
import { User } from '../user';
import { UsersComponent } from './users.component';
import { UserService } from '../user.service';

class MockSelfService {

	constructor(private self: User) { };

	get username(): string {
		return this.self.username;
	}

	get mayManageUsers$(): Observable<boolean> {
		return of(this.self.authorities.includes('ROLE_MANAGE_USERS'));
	}
}


describe('UsersComponent', () => {
	let component: UsersComponent;
	let fixture: ComponentFixture<UsersComponent>;

	const USER_ADMIN: User = { id: uuid(), username: 'Administrator', password: null, authorities: ['ROLE_MANAGE_USERS'] };
	const USER_NORMAL: User = { id: uuid(), username: 'Benedict', password: null, authorities: [] };

	const setUp = (self: User, testUsers: User[]) => {
		const userServiceStub = jasmine.createSpyObj('UserService', ['getUsers']);
		userServiceStub.getUsers.and.returnValue(of(testUsers));

		TestBed.configureTestingModule({
			declarations: [UsersComponent],
			imports: [RouterTestingModule],
			providers: [
				{ provide: SelfService, useFactory: () => { return new MockSelfService(self); } },
				{ provide: UserService, useValue: userServiceStub }
			]
		});

		fixture = TestBed.createComponent(UsersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};

	const mayManageUsers = function() {
		var may: boolean = null;
		component.mayManageUsers$.subscribe({
			next: (m) => may = m,
			error: (err) => fail(err),
			complete: () => { }
		});
		return may;
	}

	const assertInvariants = function() {
		expect(component).toBeTruthy();

		const manageUsers: boolean = mayManageUsers();
		const element: HTMLElement = fixture.nativeElement;
		const addUser: HTMLElement = element.querySelector('#add-user');
		const usersList: HTMLUListElement = element.querySelector('ul#users');
		expect(addUser).withContext('add-user element').not.toBeNull();
		expect(usersList).withContext('users list element').not.toBeNull();
		const userEntries: NodeListOf<HTMLLIElement> = usersList.querySelectorAll('li');
		expect(userEntries.length).withContext('users list entries').toBe(component.users.length);
		for (let i = 0; i < userEntries.length; i++) {
			const entry: HTMLLIElement = userEntries.item(i);
			const link: HTMLAnchorElement = entry.querySelector('a');
			const expectedUser: User = component.users[i];
			expect(entry.innerText).withContext('users list entry text').toBe(expectedUser.username);
			expect(link != null).withContext('users list entry has link').toBe(manageUsers);
		}
	};

	const canCreate = function(self: User, testUsers: User[]) {
		setUp(self, testUsers);

		assertInvariants();
		expect(component.users).toBe(testUsers);
	};

	it('can create [1]', () => {
		canCreate(USER_ADMIN, [USER_ADMIN]);
	});

	it('can create [2]', () => {
		canCreate(USER_NORMAL, [USER_ADMIN, USER_NORMAL]);
	});

	it('does not provide an add-user link for normal users', () => {
		setUp(USER_NORMAL, [USER_ADMIN, USER_NORMAL]);

		assertInvariants();
		const element: HTMLElement = fixture.nativeElement;
		const link = element.querySelector('a[id="add-user"]');
		expect(link).withContext('add-user link').toBeNull();
	});

	it('provides an add-user link for an administrator', () => {
		setUp(USER_ADMIN, [USER_ADMIN, USER_NORMAL]);

		assertInvariants();
		const element: HTMLElement = fixture.nativeElement;
		const link = element.querySelector('a[id="add-user"]');
		expect(link).withContext('add-user link').not.toBeNull();
		expect(link.textContent).toContain('Add user');
	});
});
