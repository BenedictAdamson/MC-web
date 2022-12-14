import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractUserBackEndService } from '../service/abstract.user.back-end.service';
import { User } from '../user';
import { UserComponent } from './user.component';

import { MockUserBackEndService } from '../service/mock/mock.user.back-end.service';


describe('UserComponent', () => {
	let component: UserComponent;
	let fixture: ComponentFixture<UserComponent>;

	const USER_A: User = { id: uuid(), username: 'Administrator', password: null, authorities: ['ROLE_PLAYER', 'ROLE_MANAGE_USERS', 'ROLE_MANAGE_GAMES'] };
	const USER_B: User = { id: uuid(), username: 'Benedict', password: null, authorities: [] };
	const EXPECTED_ROLE_NAMES_A: string[] = ['player', 'manage users', 'manage games'];
	const EXPECTED_ROLE_NAMES_B: string[] = [];

	const getUser = function(component: UserComponent): User | null {
    let user: User | null = null;
    component.user$.subscribe({
			next: (u) => user = u,
			error: (err) => fail(err),
			complete: () => { }
		});
		return user;
	};

	const setUp = (testUser: User) => {
		const userServiceStub = new MockUserBackEndService([testUser]);

		TestBed.configureTestingModule({
			declarations: [UserComponent],
			providers: [{
				provide: ActivatedRoute,
				useValue: {
					paramMap: of(convertToParamMap({ id: testUser.id }))
				}
			},
			{ provide: AbstractUserBackEndService, useValue: userServiceStub }]
		});

		fixture = TestBed.createComponent(UserComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};
	const canCreate = function(user: User, expectedRoleNames: string[]) {
		setUp(user);

		expect(component).toBeTruthy();
		expect(getUser(component)).toBe(user);

		const html: HTMLElement = fixture.nativeElement;
		const displayText: string = html.innerText;
		const rolesElement: HTMLUListElement | null = html.querySelector('ul#roles');
		expect(displayText).withContext("The user page includes the user name").toContain(user.username);
		expect(rolesElement).withContext('roles element').not.toBeNull();//guard

		if (rolesElement) {
			const roleEntries: NodeListOf<HTMLLIElement> = rolesElement.querySelectorAll('li');
			expect(roleEntries.length).withContext('number of role entries').toBe(user.authorities.length);
			for (let i = 0; i < roleEntries.length; i++) {
				const expectedRoleName: string = expectedRoleNames[i];
				const roleEntry: HTMLLIElement = roleEntries.item(i);
				expect(roleEntry.textContent).withContext('role text').toContain(expectedRoleName);
			}// for
		}// if

	};
	it('can create [a]', () => {
		canCreate(USER_A, EXPECTED_ROLE_NAMES_A);
	});
	it('can create [b]', () => {
		canCreate(USER_B, EXPECTED_ROLE_NAMES_B);
	});
});
