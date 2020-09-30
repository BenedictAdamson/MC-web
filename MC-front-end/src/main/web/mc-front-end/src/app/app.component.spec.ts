import { Injectable } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SelfComponent } from './self/self.component';
import { SelfService } from './self.service';

describe('AppComponent', () => {

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			providers: [
			],
			declarations: [
				AppComponent, SelfComponent
			],
			imports: [HttpClientTestingModule, RouterTestingModule]
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
