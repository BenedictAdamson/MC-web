import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Scenario } from '../scenario';
import { ScenarioService } from '../service/scenario.service';

@Component({
	selector: 'app-scenario',
	templateUrl: './scenario.component.html',
	styleUrls: ['./scenario.component.css']
})
export class ScenarioComponent implements OnInit {


	static getScenarioPath(scenario: string): string {
		return '/scenario/' + scenario;
	}

	scenario: Scenario;

	constructor(
		private route: ActivatedRoute,
		private scenarioService: ScenarioService
	) { }

	ngOnInit() {
		const scenario: string | null = this.route.snapshot.paramMap.get('scenario');
		if (!scenario) throw new Error('missing scenario')
		this.getScenario(scenario);
	}


	private getScenario(id: string): void {
		this.scenarioService.getScenario(id)
			.subscribe(scenario => this.scenario = scenario);
	}
}
