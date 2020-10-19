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
		const rootElement: HTMLElement = fixture.nativeElement;
		const heading: HTMLHeadingElement = rootElement.querySelector('h2');
		expect(heading).withContext('has heading').not.toBeNull();
		expect(heading.textContent).withContext('heading text').toContain('Scenarios');
		const list: HTMLUListElement = rootElement.querySelector('ul');
		expect(list).withContext('has list').not.toBeNull();
		const listEntries: NodeListOf<HTMLLIElement> = list.querySelectorAll("li");
		expect(listEntries.length).withContext('list length').toEqual(identifiers.length);
		for (let i = 0; i < listEntries.length; i++) {
			const expected: ScenarioIdentifier = identifiers[i];
			const entry: HTMLLIElement = listEntries.item(i);
			const link: HTMLAnchorElement = entry.querySelector('a');
			expect(link).withContext('entry has link').not.toBeNull();
			expect(link.textContent).withContext('entry link text contains title').toContain(expected.title);
		}
	};

	it('can create [1]', () => {
		canCreate([IDENTIFIER_A]);
	});

	it('can create [2]', () => {
		canCreate([IDENTIFIER_A, IDENTIFIER_B]);
	});
});
