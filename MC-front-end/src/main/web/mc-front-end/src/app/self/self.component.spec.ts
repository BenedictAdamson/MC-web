import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { SelfComponent } from './self.component';
import { SelfService } from '../self.service';


describe('SelfComponent', () => {
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
				{ provide: SelfService, useClass: SelfService }
			],
			declarations: [
				SelfComponent
			]
		}).compileComponents();
	}));
	beforeEach(() => {
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

	it('should initially provide a login link', () => {
		fixture.detectChanges();
		const element: HTMLElement = fixture.nativeElement;
		const button = element.querySelector('a[id="login"]');
		expect(button).not.toBeNull();
		expect(button.textContent).toContain('login');
	});

	let checkElement = function() {
		var username: string = getUsername(component);
		const element: HTMLElement = fixture.nativeElement;
		expect(element.textContent).toContain(username);
	}

	it('should display user-name after login', (done) => {
		var nCalls: number = 0;
		component.login().subscribe({
			next: () => {
				fixture.detectChanges();
				checkElement();
				++nCalls;
				done();
			},
			error: (err) => done.fail(err),
			complete: () => {
				checkElement();
				nCalls ? {} : done();
			}
		});
	});
});