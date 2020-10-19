import { of } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ScenarioIdentifier } from '../scenario-identifier';
import { ScenariosComponent } from './scenarios.component';
import { ScenarioService } from '../scenario.service';


describe('ScenariosComponent', () => {
	let component: ScenariosComponent;
	let fixture: ComponentFixture<ScenariosComponent>;

	const IDENTIFIER_A: ScenarioIdentifier = { id: '123456', title: 'Section Attack' };
	const IDENTIFIER_B: ScenarioIdentifier = { id: '345678', title: 'Beach Assault' };

	const setUp = (identifiers: ScenarioIdentifier[]) => {
		const scenarioServiceStub = jasmine.createSpyObj('ScenarioService', ['getScenarioIdentifiers']);
		scenarioServiceStub.getScenarioIdentifiers.and.returnValue(of(identifiers));

		TestBed.configureTestingModule({
			declarations: [ScenariosComponent],
			imports: [RouterTestingModule],
			providers: [
				{ provide: ScenarioService, useValue: scenarioServiceStub }
			]
		});

		fixture = TestBed.createComponent(ScenariosComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};

	const canCreate = (identifiers: ScenarioIdentifier[]) => {
		setUp(identifiers);

		expect(component).toBeTruthy();
		expect(component.scenarios).toBe(identifiers);
		const element: HTMLElement = fixture.nativeElement;
		const heading = element.querySelector('h2');
		expect(heading).withContext('has heading').not.toBeNull();
		expect(heading.textContent).withContext('heading text').toContain('Scenarios');
	};

	it('can create [1]', () => {
		canCreate([IDENTIFIER_A]);
	});

	it('can create [2]', () => {
		canCreate([IDENTIFIER_A, IDENTIFIER_B]);
	});
});
