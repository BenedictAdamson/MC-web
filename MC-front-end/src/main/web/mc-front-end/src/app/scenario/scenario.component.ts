import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, mergeMap } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Scenario } from '../scenario';
import { ScenarioService } from '../service/scenario.service';
import {NamedUUID} from "../named-uuid";

@Component({
	selector: 'app-scenario',
	templateUrl: './scenario.component.html',
	styleUrls: ['./scenario.component.css']
})
export class ScenarioComponent implements OnInit {

	constructor(
		private route: ActivatedRoute,
		private scenarioService: ScenarioService
	) { }


	get id$(): Observable<string> {
		return this.route.paramMap.pipe(
			map(params => params.get('scenario')),
			distinctUntilChanged(),
			filter(id => !!id),
			map((id: string | null) => id as string)
		);
	}

	get scenario$(): Observable<Scenario> {
		return this.id$.pipe(
			mergeMap(id => this.scenarioService.get(id)),
			filter(scenario => !!scenario),
			map((scenario: Scenario | null) => scenario as Scenario)
		);
	}

  get title$(): Observable<string> {
    return this.scenario$.pipe(
      map(s => s.title)
    )
  }

  get description$(): Observable<string> {
    return this.scenario$.pipe(
      map(s => s.description)
    )
  }

  get characters$(): Observable<NamedUUID[]> {
    return this.scenario$.pipe(
      map(s => s.characters)
    )
  }

	ngOnInit() {
		// Do nothing
	}

}
