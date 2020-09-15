import { Observable, Subject, defer, of } from 'rxjs';
import { KeycloakEvent, KeycloakEventType, KeycloakService } from 'keycloak-angular';

import { SelfService } from './self.service';


class MockKeycloakService extends KeycloakService {

	get keycloakEvents$(): Subject<KeycloakEvent> { return this.events$; };

	nextUsername: string = "jeff";
	private username: string = null;
	private events$: Subject<KeycloakEvent> = new Subject;

	init(): Promise<boolean> {
		return Promise.resolve(true);
	}

	getUsername(): string { return this.username; }

	async isLoggedIn(): Promise<boolean> { return Promise.resolve(this.username != null); }

	async login(options: any): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.username = this.nextUsername;
				this.nextUsername = null;
				this.events$.next({
					type: KeycloakEventType.OnAuthSuccess
				});
				resolve();
			} catch (e) {
				reject(options + ' ' + e);
			}
		});
	}
};

describe('SelfService', () => {

	let assertInvariants: CallableFunction = (s: SelfService) => {
		expect(s.isLoggedIn()).toBe(s.getUsername() != null, 'isLoggedIn() iff getUsername() is non null.');
	};

	let keycloakFactory: Observable<KeycloakService>;
	let service: SelfService;

	beforeEach(() => {
		keycloakFactory = of(new MockKeycloakService);
		service = new SelfService(keycloakFactory);
	});

	it('should be created with initial state', () => {
		expect(service).toBeTruthy();
		assertInvariants(service);
		expect(service.isLoggedIn()).toBe(false, 'not loggedIn');
	});

	it('can get keycloak', async () => {
		var keycloak: KeycloakService = await service.getKeycloak$().toPromise();

		assertInvariants(service);
		expect(keycloak).not.toBeNull();
	});

	it('can get keycloak again', async () => {
		var keycloak1: KeycloakService = await service.getKeycloak$().toPromise();
		var keycloak2: KeycloakService = await service.getKeycloak$().toPromise();

		assertInvariants(service);
		expect(keycloak2).toBe(keycloak1);
	});

	it('should set username after successful login', async () => {
		await service.login$().toPromise();

		assertInvariants(service);
		expect(service.isLoggedIn()).toBe(true, 'loggedIn');
	});
});
