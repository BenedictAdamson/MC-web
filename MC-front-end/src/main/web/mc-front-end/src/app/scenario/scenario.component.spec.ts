import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { AbstractScenarioBackEndService } from '../service/abstract.scenario.back-end.service';
import { NamedUUID } from '../named-uuid';
import { Scenario } from '../scenario';
import { ScenarioComponent } from './scenario.component';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MockScenarioBackEndService } from '../service/mock/mock.scenario.back-end.service';

describe('ScenarioComponent', () => {
	let component: ScenarioComponent;
	let fixture: ComponentFixture<ScenarioComponent>;

	const SCENARIO_ID_A: string = uuid();
	const SCENARIO_ID_B: string = uuid();
	const CHARACTER_A: NamedUUID = { id: uuid(), title: 'Sergeant' };
	const CHARACTER_B: NamedUUID = { id: uuid(), title: 'Private' };
	const SCENARIO_A: Scenario = new Scenario(
		SCENARIO_ID_A,
		'Section Attack',
		'Basic fire-and-movement tactical training.',
		[CHARACTER_A]
	);
	const SCENARIO_B: Scenario = new Scenario(
		SCENARIO_ID_B,
		'Beach Assault',
		'Fast and deadly.',
		[CHARACTER_A, CHARACTER_B]
	);


	const getScenario = (sc: ScenarioComponent): Scenario | null => {
		let scenario: Scenario | null = null;
		sc.scenario$.subscribe({
			next: (s) => scenario = s,
			error: (err) => fail(err),
			complete: () => { }
		});
		return scenario;
	};


  const getTitle = (sc: ScenarioComponent): string | null => {
    let title: string | null = null;
    sc.title$.subscribe({
      next: (t) => title = t,
      error: (err) => fail(err),
      complete: () => { }
    });
    return title;
  };


  const getDescription = (sc: ScenarioComponent): string | null => {
    let description: string | null = null;
    sc.description$.subscribe({
      next: (d) => description = d,
      error: (err) => fail(err),
      complete: () => { }
    });
    return description;
  };


  const getCharacters = (sc: ScenarioComponent): NamedUUID[] | null => {
    let characters: NamedUUID[] | null = null;
    sc.characters$.subscribe({
      next: (c) => characters = c,
      error: (err) => fail(err),
      complete: () => { }
    });
    return characters;
  };


	const setUpForNgInit = (testScenario: Scenario,) => {
		const scenarioBackEndService: AbstractScenarioBackEndService = new MockScenarioBackEndService([testScenario]);

		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			declarations: [ScenarioComponent],
			providers: [{
				provide: ActivatedRoute,
				useValue: {
					paramMap: of(convertToParamMap({ scenario: testScenario.identifier }))
				}
			},
			{ provide: AbstractScenarioBackEndService, useValue: scenarioBackEndService }]
		});

		fixture = TestBed.createComponent(ScenarioComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};


	const canCreate = (testScenario: Scenario) => {
		setUpForNgInit(testScenario);

		expect(component).toBeTruthy();
		expect(getScenario(component)).toBe(testScenario);
    expect(getTitle(component)).toBe(testScenario.title);
    expect(getDescription(component)).toBe(testScenario.description);
    expect(getCharacters(component)).toEqual(testScenario.characters);

		const html: HTMLElement = fixture.nativeElement;
		const selfLink: HTMLAnchorElement | null = html.querySelector('a#scenario');
		const charactersElement: HTMLElement | null = html.querySelector('#characters');

		const displayText: string = html.innerText;
		expect(displayText.includes(testScenario.title)).withContext('displayed text includes title').toBeTrue();
		expect(displayText.includes(testScenario.description)).withContext('displayed text includes description').toBeTrue();
		expect(selfLink).withContext('self link').not.toBeNull();
		expect(charactersElement).withContext('characters element').not.toBeNull();
		if (charactersElement) {
			const characterEntries: NodeListOf<HTMLLIElement> = charactersElement.querySelectorAll('li');
			expect(characterEntries.length).withContext('number of character entries').toEqual(testScenario.characters.length);
			for (let i = 0; i < characterEntries.length; i++) {
				const entry: HTMLLIElement = characterEntries.item(i);
				const characterText: string = entry.innerText;
				expect(characterText).withContext('character entry').toEqual(testScenario.characters[i].title);
			}
		}
	};

	it('can create [a]', () => {
		canCreate(SCENARIO_A);
	});

	it('can create [b]', () => {
		canCreate(SCENARIO_B);
	});
});
