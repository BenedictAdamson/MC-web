import { v4 as uuid, parse as parseUuid } from 'uuid';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GameService } from '../game.service';

@Component({
	selector: 'app-scenario',
	templateUrl: './games.component.html',
	styleUrls: ['./games.component.css']
})
export class GamesComponent implements OnInit {

	scenario: uuid;
	games: string[];

	constructor(
		private route: ActivatedRoute,
		private gameService: GameService
	) { }

	ngOnInit() {
		this.scenario = this.route.snapshot.paramMap.get('id');
		this.getGames();
	}


	private getGames(): void {
		this.gameService.getGamesOfScenario(this.scenario)
			.subscribe(games => this.games = games);
	}
}
