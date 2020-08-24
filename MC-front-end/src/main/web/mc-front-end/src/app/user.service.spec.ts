import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { UserService } from './user.service';
import { User } from './user';


describe('UserService', () => {
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;

    const ADMINISTRATOR = { username: 'Administrator', password: null, authorities: ['ROLE_ADMIN'] };
    const USER = { username: 'Benedict', password: null, authorities: [] };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });

        /* Inject for each test:
         * HTTP requests will be handled by the mock back-end.
          */
        httpClient = TestBed.get(HttpClient);
        httpTestingController = TestBed.get(HttpTestingController);
    });

    it('should be created', () => {
        const service: UserService = TestBed.get(UserService);
        expect(service).toBeTruthy();
    });

    it('can get users', () => {
        const testUsers: User[] = [ADMINISTRATOR];
        const service: UserService = TestBed.get(UserService);

        service.getUsers().subscribe(users => expect(users).toEqual(testUsers));

        const request = httpTestingController.expectOne('/api/user');
        expect(request.request.method).toEqual('GET');
        request.flush(testUsers);
        httpTestingController.verify();
    });

    let canGetUser: CallableFunction;
    canGetUser = (testUser: User) => {
        const username = testUser.username;
        const service: UserService = TestBed.get(UserService);

        service.getUser(username).subscribe(user => expect(user).toEqual(testUser));

        const request = httpTestingController.expectOne(`/api/user/${username}`);
        expect(request.request.method).toEqual('GET');
        request.flush(testUser);
        httpTestingController.verify();
    };
    it('can get the administrator', () => {
        canGetUser(ADMINISTRATOR);
    });
    it('can get other user', () => {
        canGetUser(USER);
    });
});
