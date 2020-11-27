import { v4 as uuid } from 'uuid';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Scenario } from '../scenario';
import { ScenarioService } from '../scenario.service';

@Component({
	selector: 'app-scenario',
	templateUrl: './scenario.component.html',
	styleUrls: ['./scenario.component.css']
})
export class ScenarioComponent implements OnInit {


	static getScenarioPath(scenario: uuid): string {
		return '/scenario/' + scenario;
	}

	scenario: Scenario;

	constructor(
		private route: ActivatedRoute,
		private scenarioService: ScenarioService
	) { }

	ngOnInit() {
		const id: string = this.route.snapshot.paramMap.get('scenario');
		this.getScenario(id);
	}


	private getScenario(id: string): void {
		this.scenarioService.getScenario(id)
			.subscribe(scenario => this.scenario = scenario);
	}
}
