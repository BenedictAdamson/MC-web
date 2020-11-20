import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { User } from '../user';
import { UserComponent } from './user.component';
import { UserService } from '../user.service';

import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('UserComponent', () => {
	let component: UserComponent;
	let fixture: ComponentFixture<UserComponent>;

	const USER_A = { username: 'Administrator', password: null, authorities: ['ROLE_ADMIN'] };
	const USER_B = { username: 'Benedict', password: null, authorities: [] };

	const setUp = (testUser: User) => {
		const userServiceStub = jasmine.createSpyObj('UserService', ['getUser']);
		userServiceStub.getUser.and.returnValue(of(testUser));

		TestBed.configureTestingModule({
			declarations: [UserComponent],
			providers: [{
				provide: ActivatedRoute,
				useValue: {
					params: of({ username: testUser.username }),
					snapshot: {
						paramMap: convertToParamMap({ username: testUser.username })
					}
				}
			},
			{ provide: UserService, useValue: userServiceStub }]
		});

		fixture = TestBed.createComponent(UserComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};
	const canCreate = (testUser: User) => {
		setUp(testUser);

		expect(component).toBeTruthy();
		expect(component.user).toBe(testUser);

		const html: HTMLElement = fixture.nativeElement;
		const displayText: string = html.innerText;
		expect(displayText.includes(testUser.username)).withContext("The user page includes the user name").toBeTrue();
	};
	it('can create [a]', () => {
		canCreate(USER_A);
	});
	it('can create [b]', () => {
		canCreate(USER_B);
	});
});
