import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GameService } from '../game.service';
import { Scenario } from '../scenario';
import { ScenarioService } from '../scenario.service';

@Component({
	selector: 'app-scenario',
	templateUrl: './scenario.component.html',
	styleUrls: ['./scenario.component.css']
})
export class ScenarioComponent implements OnInit {

	scenario: Scenario;
	games: string[];

	constructor(
		private route: ActivatedRoute,
		private scenarioService: ScenarioService,
		private gameService: GameService
	) { }

	ngOnInit() {
		const id: string = this.route.snapshot.paramMap.get('scenario');
		this.getScenario(id);
		this.getGames(id);
	}


	private getScenario(id: string): void {
		this.scenarioService.getScenario(id)
			.subscribe(scenario => this.scenario = scenario);
	}

	private getGames(id: string): void {
		this.gameService.getGamesOfScenario(id)
			.subscribe(games => this.games = games);
	}
}
