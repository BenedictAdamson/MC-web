import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Scenario } from '../scenario';
import { ScenarioService } from '../scenario.service';

@Component({
	selector: 'app-scenarios',
	templateUrl: './scenarios.component.html',
	styleUrls: ['./scenarios.component.css']
})
export class ScenariosComponent implements OnInit {

	scenarios: Scenario[];

	constructor(private scenarioService: ScenarioService) { }

	ngOnInit() {
		this.scenarioService.getScenarios().subscribe(scenarios => this.scenarios = scenarios);
	}

}
