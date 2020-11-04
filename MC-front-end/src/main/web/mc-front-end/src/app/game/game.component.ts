import { v4 as uuid, parse as parseUuid } from 'uuid';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Game } from '../game'
import { GameIdentifier } from '../game-identifier'
import { GameService } from '../game.service';
import { Scenario } from '../scenario';
import { ScenarioService } from '../scenario.service';

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

	scenario: Scenario;
	game: Game;

	constructor(
		private route: ActivatedRoute,
		private scenarioService: ScenarioService,
		private gameService: GameService
	) { }

	ngOnInit(): void {
		const scenario: uuid = parseUuid(this.route.snapshot.paramMap.get('scenario'));
		const created: string = this.route.snapshot.paramMap.get('created');
		const gameId: GameIdentifier = { scenario: scenario, created: created };
		this.getGame(gameId);
		this.getScenario(scenario);
	}


	private getScenario(id: uuid): void {
		this.scenarioService.getScenario(id)
			.subscribe(scenario => this.scenario = scenario);
	}

	private getGame(id: GameIdentifier): void {
		this.gameService.getGame(id)
			.subscribe(game => this.game = game);
	}

}
