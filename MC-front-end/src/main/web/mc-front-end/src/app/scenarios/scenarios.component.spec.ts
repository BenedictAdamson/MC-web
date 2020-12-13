import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NamedUUID } from '../named-uuid';
import { ScenariosComponent } from './scenarios.component';
import { ScenarioService } from '../service/scenario.service';


describe('ScenariosComponent', () => {
	let component: ScenariosComponent;
	let fixture: ComponentFixture<ScenariosComponent>;

	const IDENTIFIER_A: NamedUUID = { id: uuid(), title: 'Section Attack' };
	const IDENTIFIER_B: NamedUUID = { id: uuid(), title: 'Beach Assault' };

	const setUp = (identifiers: NamedUUID[]) => {
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

	const canCreate = (identifiers: NamedUUID[]) => {
		setUp(identifiers);

		expect(component).toBeTruthy();
		expect(component.scenarios).toBe(identifiers);
		const rootElement: HTMLElement = fixture.nativeElement;
		const heading: HTMLHeadingElement | null = rootElement.querySelector('h2');
		const headingText: string | null = heading ? heading.textContent : null;
		expect(heading).withContext('has heading').not.toBeNull();
		expect(headingText).withContext('heading text').toContain('Scenarios');
		const list: HTMLUListElement | null = rootElement.querySelector('ul');
		expect(list).withContext('has list').not.toBeNull();
		if (list) {
			const listEntries: NodeListOf<HTMLLIElement> = list.querySelectorAll("li");
			expect(listEntries.length).withContext('list length').toEqual(identifiers.length);
			for (let i = 0; i < listEntries.length; i++) {
				const expected: NamedUUID = identifiers[i];
				const entry: HTMLLIElement = listEntries.item(i);
				const link: HTMLAnchorElement | null = entry.querySelector('a');
				const linkText: string | null = link ? link.innerText : null;
				expect(link).withContext('entry has link').not.toBeNull();
				expect(linkText).withContext('entry link text contains title').toContain(expected.title);
			}// for
		}// if
	};

	it('can create [1]', () => {
		canCreate([IDENTIFIER_A]);
	});

	it('can create [2]', () => {
		canCreate([IDENTIFIER_A, IDENTIFIER_B]);
	});
});
