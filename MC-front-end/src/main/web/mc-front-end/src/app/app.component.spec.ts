import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SelfComponent } from './self/self.component';

describe('AppComponent', () => {

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			providers: [
			],
			declarations: [
				AppComponent, SelfComponent
			],
			imports: [HttpClientTestingModule,
				RouterTestingModule.withRoutes(
					[{ path: '', component: HomeComponent }]
				)
			]
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
