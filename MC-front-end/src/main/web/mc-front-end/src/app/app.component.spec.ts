import { v4 as uuid } from 'uuid';

import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { MockSelfService } from './service/mock/mock.self.service';
import { SelfComponent } from './self/self.component';
import { SelfService } from './service/self.service';
import { User } from './user';


describe('AppComponent', () => {
	let selfService: MockSelfService;

	const setUp = function(authorities: string[]) {
		const self: User = { id: uuid(), username: 'Benedict', password: null, authorities: authorities };
		selfService = new MockSelfService(self);
		TestBed.configureTestingModule({
			declarations: [
				AppComponent, SelfComponent
			],
			imports: [HttpClientTestingModule,
				RouterTestingModule.withRoutes(
					[{ path: '', component: HomeComponent }]
				)
			],
			providers: [{ provide: SelfService, useValue: selfService }]
		}).compileComponents();
	};

	const testSetUp = function(authorities: string[], expectMayListUsers: boolean) {
		setUp(authorities);
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.debugElement.componentInstance;
		fixture.detectChanges();
		const html = fixture.debugElement.nativeElement;
		const usersLink = html.querySelector('a[id="users"]');
		const scenariosLink = html.querySelector('a[id="scenarios"]');

		expect(app).toBeTruthy();

		expect(html.querySelector('h1').textContent).withContext('h1 text').toContain('Mission Command');
		expect(usersLink != null).withContext('has users link element').toBe(expectMayListUsers);
		if (usersLink != null) {
			expect(usersLink.textContent).withContext('users link text').toContain('Users');
		}
		expect(scenariosLink).withContext('scenarios link element').not.toBeNull();
		expect(scenariosLink.textContent).withContext('scenarios link text').toContain('Scenarios');
	};

	it('can be constructed [no roles]', () => {
		testSetUp([], false);
	});

	it('can be constructed [player]', () => {
		testSetUp(['ROLE_PLAYER'], true);
	});
});
