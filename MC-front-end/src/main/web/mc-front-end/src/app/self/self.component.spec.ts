import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KeycloakService, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import { Subject } from 'rxjs';

import { SelfComponent } from './self.component';
import { SelfService } from '../self.service';

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
				resolve(null);
			} catch (e) {
				reject(options + ' ' + e);
			}
		});
	}
};

describe('SelfComponent', () => {
	let keycloakFactory = function() { return new MockKeycloakService };
	let fixture: ComponentFixture<SelfComponent>;
	let component: SelfComponent;

	let getLoggedIn = function(component: SelfComponent): boolean {
		var loggedIn: boolean = null;
		component.loggedIn$.subscribe({
			next: (l) => loggedIn = l,
			error: (err) => fail(err),
			complete: () => { }
		});
		return loggedIn;
	};

	let getUsername = function(component: SelfComponent): string {
		var username: string = null;
		component.username$.subscribe({
			next: (u) => username = u,
			error: (err) => fail(err),
			complete: () => { }
		});
		return username;
	};

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: KeycloakService, useClass: MockKeycloakService },
				{ provide: SelfService, useValue: new SelfService(keycloakFactory) }
			],
			declarations: [
				SelfComponent
			]
		}).compileComponents();
	}));
	beforeEach(() => {
		TestBed.inject(KeycloakService);
		fixture = TestBed.createComponent(SelfComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		expect(component).toBeDefined();
	});

	it('should not initially be logged in', () => {
		expect(getLoggedIn(component)).toBe(false, 'not loggedIn');
		expect(getUsername(component)).toBeNull();
	});

	it('should have an identity after login', (done) => {
		var nCalls: number = 0;
		component.login().subscribe({
			next: () => {
				var loggedIn: boolean = getLoggedIn(component);
				var username: string = getUsername(component);
				expect(username).not.toBe(null, 'username not null');
				expect(loggedIn).toBe(true, 'loggedIn');
				++nCalls;
				done();
			},
			error: (err) => done.fail(err),
			complete: () => (!nCalls) ? done.fail('no values') : {}
		});
	});

	it('should initially provide a login button', () => {
		fixture.detectChanges();
		const element: HTMLElement = fixture.nativeElement;
		const button = element.querySelector('button');
		expect(button).not.toBeNull();
		expect(button.textContent).toContain('login');
	});

	it('should display user-name after login', (done) => {
		var nCalls: number = 0;
		component.login().subscribe({
			next: () => {
				fixture.detectChanges();
				var username: string = getUsername(component);
				const element: HTMLElement = fixture.nativeElement;
				expect(element.textContent).toContain(username);
				++nCalls;
				done();
			},
			error: (err) => done.fail(err),
			complete: () => (!nCalls) ? done.fail('no values') : {}
		});
	});
});