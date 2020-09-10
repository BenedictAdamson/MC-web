import { KeycloakService, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import { Subject } from 'rxjs';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { SelfComponent } from './self/self.component';

class MockKeycloakService {

	keycloakEvents$: Subject<KeycloakEvent> = new Subject;

	private username: string = null;
	private nextUsername: string = "jeff";

	getUsername(): string { return this.username; }

	async isLoggedIn(): Promise<boolean> { return Promise.resolve(this.username != null); }

	async login(options: any): Promise<void> {
		return new Promise((resolve, reject) => {
			this.username = this.nextUsername;
			this.nextUsername = null;
			this.keycloakEvents$.next({
				type: KeycloakEventType.OnAuthSuccess
			});
			resolve();
		});
	}
}

describe('AppComponent', () => {
	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: KeycloakService, useClass: MockKeycloakService }
			],
			declarations: [
				AppComponent, SelfComponent
			],
			imports: [RouterTestingModule]
		}).compileComponents();
	}));

	it('should create the app', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.debugElement.componentInstance;
		expect(app).toBeTruthy();
	});

	it(`should have as title 'Mission Command'`, () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.debugElement.componentInstance;
		expect(app.title).toEqual('Mission Command');
	});

	it('should render title in a h1 tag', () => {
		const fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		const compiled = fixture.debugElement.nativeElement;
		expect(compiled.querySelector('h1').textContent).toContain('Mission Command');
	});
});
