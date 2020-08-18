import { of } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { User } from '../user';
import { UsersComponent } from './users.component';
import { UserService } from '../user.service';

describe('UsersComponent', () => {
    let component: UsersComponent;
    let fixture: ComponentFixture<UsersComponent>;

    const PLAYER_A = { username: 'Administrator', password: null, authorities: ['ROLE_ADMIN'] };
    const PLAYER_B = { username: 'Benedict', password: null, authorities: [] };

    const setUp = (testUsers: User[]) => {
        const userServiceStub = jasmine.createSpyObj('UserService', ['getUsers']);
        userServiceStub.getUsers.and.returnValue(of(testUsers));

        TestBed.configureTestingModule({
            declarations: [UsersComponent],
            imports: [RouterTestingModule],
            providers: [
                { provide: UserService, useValue: userServiceStub }]
        });

        fixture = TestBed.createComponent(UsersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    };

    const canCreate = (testUsers: User[]) => {
        setUp(testUsers);

        expect(component).toBeTruthy();
        expect(component.users).toBe(testUsers);
    };

    it('can create [1]', () => {
        canCreate([PLAYER_A]);
    });

    it('can create [2]', () => {
        canCreate([PLAYER_A, PLAYER_B]);
    });
});
