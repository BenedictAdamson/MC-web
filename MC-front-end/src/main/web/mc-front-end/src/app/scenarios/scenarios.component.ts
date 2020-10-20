import { Component, OnInit } from '@angular/core';

import { ScenarioIdentifier } from '../scenario-identifier';
import { ScenarioService } from '../scenario.service';

@Component({
	selector: 'app-scenarios',
	templateUrl: './scenarios.component.html',
	styleUrls: ['./scenarios.component.css']
})
export class ScenariosComponent implements OnInit {

	scenarios: ScenarioIdentifier[];

	constructor(private scenarioService: ScenarioService) { }

	ngOnInit() {
		this.scenarioService.getScenarioIdentifiers().subscribe(scenarios => this.scenarios = scenarios);
	}

}
