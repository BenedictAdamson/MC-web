import { v4 as uuid } from 'uuid';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AbstractUserBackEndService } from '../service/abstract.user.back-end.service';
import { AbstractSelfService } from '../service/abstract.self.service';
import { MockSelfService } from '../service/mock/mock.self.service';
import { User } from '../user';
import { UsersComponent } from './users.component';

import { MockUserBackEndService } from '../service/mock/mock.user.back-end.service';


describe('UsersComponent', () => {
	let component: UsersComponent;
	let fixture: ComponentFixture<UsersComponent>;
	let selfService: AbstractSelfService;

	const USER_ADMIN: User = { id: uuid(), username: 'Administrator', password: null, authorities: ['ROLE_MANAGE_USERS'] };
	const USER_NORMAL: User = { id: uuid(), username: 'Benedict', password: null, authorities: [] };

	const setUp = (self: User, testUsers: User[]) => {
		const userServiceStub = new MockUserBackEndService(testUsers);

		TestBed.configureTestingModule({
			declarations: [UsersComponent],
			imports: [RouterTestingModule],
			providers: [
				{ provide: AbstractSelfService, useFactory: () => { return new MockSelfService(self); } },
				{ provide: AbstractUserBackEndService, useValue: userServiceStub }
			]
		});

		fixture = TestBed.createComponent(UsersComponent);
		component = fixture.componentInstance;
		selfService = TestBed.inject(AbstractSelfService);
		selfService.checkForCurrentAuthentication().subscribe();
		fixture.detectChanges();
	};

	const mayManageUsers = function(): boolean | null {
    let may: boolean | null = null;
    component.mayManageUsers$.subscribe({
			next: (m) => may = m,
			error: (err) => fail(err),
			complete: () => { }
		});
		return may;
	}

	const assertInvariants = function() {
		expect(component).toBeTruthy();

		const manageUsers: boolean | null = mayManageUsers();
		const element: HTMLElement = fixture.nativeElement;
		const addUser: HTMLElement | null = element.querySelector('#add-user');
		const usersList: HTMLUListElement | null = element.querySelector('ul#users');
		expect(manageUsers).withContext('manageUsers').not.toBeNull();
		expect(addUser).withContext('add-user element').not.toBeNull();
		expect(usersList).withContext('users list element').not.toBeNull();
		if (usersList) {
			const userEntries: NodeListOf<HTMLLIElement> = usersList.querySelectorAll('li');
			expect(userEntries.length).withContext('users list entries').toBe(component.users.length);
			for (let i = 0; i < userEntries.length; i++) {
				const expectedUser: User = component.users[i];
				const entry: HTMLLIElement = userEntries.item(i);
				const link: HTMLAnchorElement | null = entry.querySelector('a');
				expect(entry.innerText).withContext('users list entry text').toBe(expectedUser.username);
				if (manageUsers != null) {
					expect(link != null).withContext('users list entry has link').toBe(manageUsers);
				}
			}// for
		}// if
	};

	const canCreate = function(self: User, testUsers: User[]) {
		setUp(self, testUsers);

		assertInvariants();
		expect(component.users).toEqual(testUsers);
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
		const link: HTMLAnchorElement | null = element.querySelector('a[id="add-user"]');
		const linkText: string | null = link ? link.textContent : null;
		expect(link).withContext('add-user link').not.toBeNull();
		expect(linkText).withContext('add-user link text').toContain('Add user');
	});
});
