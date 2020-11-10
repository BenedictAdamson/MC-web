import { of } from 'rxjs';

import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SelfComponent } from './self/self.component';
import { SelfService } from './self.service';

describe('AppComponent', () => {
	let selfServiceStub: any;

	beforeEach(waitForAsync(() => {
		selfServiceStub = jasmine.createSpyObj('SelfService', ['checkForCurrentAuthentication']);
		selfServiceStub.checkForCurrentAuthentication.and.returnValue(of(null));

		TestBed.configureTestingModule({
			declarations: [
				AppComponent, SelfComponent
			],
			imports: [HttpClientTestingModule,
				RouterTestingModule.withRoutes(
					[{ path: '', component: HomeComponent }]
				)
			],
			providers: [{ provide: SelfService, useValue: selfServiceStub }]
		}).compileComponents();
	}));

	it('can be constructed', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.debugElement.componentInstance;
		expect(app).toBeTruthy();
		expect(selfServiceStub.checkForCurrentAuthentication.calls.count()).withContext('Checked the server for current authentication information').toBe(1);
	});

	it('renders title in a h1 tag', () => {
		const fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		const html = fixture.debugElement.nativeElement;
		expect(html.querySelector('h1').textContent).toContain('Mission Command');
	});

	it('has a Users link', () => {
		const fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		const html = fixture.debugElement.nativeElement;
		const link = html.querySelector('a[id="users"]');
		expect(link).withContext('link element').not.toBeNull();
		expect(link.textContent).withContext('link text').toContain('Users');
	});

	it('has a Scenarios link', () => {
		const fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		const html = fixture.debugElement.nativeElement;
		const link = html.querySelector('a[id="scenarios"]');
		expect(link).withContext('link element').not.toBeNull();
		expect(link.textContent).withContext('link text').toContain('Scenarios');
	});
});
