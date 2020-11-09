import { Observable, of } from 'rxjs';

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


	get authorities$(): Observable<string[]> {
		return of(this.self.authorities);
	}
}


describe('UsersComponent', () => {
	let component: UsersComponent;
	let fixture: ComponentFixture<UsersComponent>;

	const USER_ADMIN = { username: 'Administrator', password: null, authorities: ['ROLE_MANAGE_USERS'] };
	const USER_NORMAL = { username: 'Benedict', password: null, authorities: [] };

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

	const canCreate = (self: User, testUsers: User[]) => {
		setUp(self, testUsers);

		expect(component).toBeTruthy();
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

		const element: HTMLElement = fixture.nativeElement;
		const link = element.querySelector('a[id="add-user"]');
		expect(link).toBeNull();
	});

	it('provides an add-user link for an administrator', () => {
		setUp(USER_ADMIN, [USER_ADMIN, USER_NORMAL]);

		const element: HTMLElement = fixture.nativeElement;
		const link = element.querySelector('a[id="add-user"]');
		expect(link).not.toBeNull();
		expect(link.textContent).toContain('Add user');
	});
});
