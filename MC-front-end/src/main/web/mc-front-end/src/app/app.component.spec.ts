import { Observable, defer, of } from 'rxjs';

import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SelfComponent } from './self/self.component';
import { SelfService } from './self.service';



class MockSelfService {

	checkForCurrentAuthentication_calls: number = 0;

	get username(): string {
		return null;
	}

	get authorities$(): Observable<string[]> {
		return of([]);
	}

	get authenticated$(): Observable<boolean> {
		return of(false);
	}

	logout(): Observable<null> {
		return defer(() => {
			return of(null)
		});
	}

	checkForCurrentAuthentication(): Observable<null> {
		this.checkForCurrentAuthentication_calls++;
		return of(null);
	}
}// class

describe('AppComponent', () => {
	let mockSelfService;
	beforeEach(waitForAsync(() => {
		mockSelfService = new MockSelfService();
		TestBed.configureTestingModule({
			declarations: [
				AppComponent, SelfComponent
			],
			imports: [HttpClientTestingModule,
				RouterTestingModule.withRoutes(
					[{ path: '', component: HomeComponent }]
				)
			],
			providers: [{ provide: SelfService, useValue: mockSelfService }]
		}).compileComponents();
	}));

	it('can be constructed', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.debugElement.componentInstance;
		expect(app).toBeTruthy();
		expect(mockSelfService.checkForCurrentAuthentication_calls).withContext('Checked the server for current authentication information').toBe(1);
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
