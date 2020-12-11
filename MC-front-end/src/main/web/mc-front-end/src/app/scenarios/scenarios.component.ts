import { Component, OnInit } from '@angular/core';

import { NamedUUID } from '../named-uuid';
import { ScenarioService } from '../service/scenario.service';

@Component({
	selector: 'app-scenarios',
	templateUrl: './scenarios.component.html',
	styleUrls: ['./scenarios.component.css']
})
export class ScenariosComponent implements OnInit {

	scenarios: NamedUUID[];

	constructor(private scenarioService: ScenarioService) { }

	ngOnInit() {
		this.scenarioService.getScenarioIdentifiers().subscribe(scenarios => this.scenarios = scenarios);
	}

}
