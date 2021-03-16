import { v4 as uuid } from 'uuid';

import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AbstractSelfService } from './service/abstract.self.service';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { MockSelfService } from './service/mock/mock.self.service';
import { SelfComponent } from './self/self.component';
import { User } from './user';


describe('AppComponent', () => {
	let selfService: AbstractSelfService;

	const setUp = (authorities: string[]) => {
		const self: User = { id: uuid(), username: 'Benedict', password: null, authorities };
		selfService = new MockSelfService(self);
		TestBed.configureTestingModule({
			declarations: [
				AppComponent, SelfComponent
			],
			imports: [
				RouterTestingModule.withRoutes(
					[{ path: '', component: HomeComponent }]
				)
			],
			providers: [{ provide: AbstractSelfService, useValue: selfService }]
		}).compileComponents();
	};

	const testSetUp = (authorities: string[], expectMayListUsers: boolean, expectMayExamineCurrentGame: boolean) => {
		setUp(authorities);
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.debugElement.componentInstance;
		fixture.detectChanges();

		const html: HTMLElement = fixture.debugElement.nativeElement;
		const currentGameLink: HTMLAnchorElement | null = html.querySelector('a[id="current-game"]');
		const scenariosLink: HTMLAnchorElement | null = html.querySelector('a[id="scenarios"]');
		const usersLink: HTMLAnchorElement | null = html.querySelector('a[id="users"]');
		const header: HTMLElement | null = html.querySelector('h1');

		const headerText: string | null = header ? header.textContent : null;
		const scenariosLinkText: string | null = scenariosLink ? scenariosLink.textContent : null;

		expect(app).toBeTruthy();

		expect(headerText).withContext('h1 text').toContain('Mission Command');
		expect(scenariosLink).withContext('scenarios link element').not.toBeNull();
		expect(scenariosLinkText).withContext('scenarios link text').toContain('Scenarios');

		expect(usersLink != null).withContext('has users link element').toBe(expectMayListUsers);
		if (usersLink != null) {
			expect(usersLink.textContent).withContext('users link text').toContain('Users');
		}
		expect(currentGameLink != null).withContext('has current-game link element').toBe(expectMayExamineCurrentGame);
		if (currentGameLink != null) {
			expect(currentGameLink.textContent).withContext('current-game link text').toContain('Current game');
		}
	};

	it('can be constructed [no roles]', () => {
		testSetUp([], false, false);
	});

	it('can be constructed [player]', () => {
		testSetUp(['ROLE_PLAYER'], true, false);
	});
});
