import { v4 as uuid, parse as parseUuid } from 'uuid';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
		private readonly router: Router,
		private gameService: GameService
	) { }

	ngOnInit() {
		this.scenario = this.route.snapshot.parent.paramMap.get('scenario');
		this.getGames();
	}


	private getGames(): void {
		this.gameService.getGamesOfScenario(this.scenario)
			.subscribe(games => this.games = games);
	}

	/**
     * Attempts to create a new game for the scenario of this games list.
     * On completion, redirects to the the game page for that game.
	 */
	createGame(): void {
		this.gameService.createGame(this.scenario).subscribe(
			game => this.router.navigateByUrl(GameService.getGamePath(game.identifier))
		);
	}
}
