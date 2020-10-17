import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { SelfComponent } from './self.component';
import { SelfService } from '../self.service';


describe('SelfComponent', () => {
	let fixture: ComponentFixture<SelfComponent>;
	let component: SelfComponent;

	let getAuthenticated = function(component: SelfComponent): boolean {
		var loggedIn: boolean = null;
		component.authenticated$.subscribe({
			next: (l) => loggedIn = l,
			error: (err) => fail(err),
			complete: () => { }
		});
		return loggedIn;
	};

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [
				{ provide: SelfService, useClass: SelfService }
			],
			declarations: [
				SelfComponent
			]
		}).compileComponents();
	}));
	beforeEach(() => {
        /* Inject for each test:
         * HTTP requests will be handled by the mock back-end.
          */
		TestBed.get(HttpClient);
		TestBed.get(HttpTestingController);
		fixture = TestBed.createComponent(SelfComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		expect(component).toBeDefined();
	});

	it('should not initially be authenticated', () => {
		expect(getAuthenticated(component)).toBe(false, 'not authenticated');
		expect(component.username).toBeNull();
	});

	it('should initially provide a login link', () => {
		fixture.detectChanges();
		const element: HTMLElement = fixture.nativeElement;
		const button = element.querySelector('a[id="login"]');
		expect(button).not.toBeNull();
		expect(button.textContent).toContain('login');
	});

});