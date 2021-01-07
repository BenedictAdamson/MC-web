import { filter, map } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

import { Game } from '../game';
import { GameIdentifier } from '../game-identifier';
import { GameService } from '../service/game.service';
import { GamesComponent } from '../games/games.component';

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {


	static getGamePath(id: GameIdentifier): string {
		return GamesComponent.getGamesPath(id.scenario) + id.created;
	}

	identifier: GameIdentifier;
	game: Game;

	constructor(
		private route: ActivatedRoute,
		private gameService: GameService
	) { }

	ngOnInit(): void {
		this.identifier = this.getGameIdentifier();
		this.subscribeToGame();
	}


	private getGameIdentifier(): GameIdentifier {
		const route: ActivatedRouteSnapshot = this.route.snapshot;
		if (!route.parent) throw new Error('missing this.route.parent');
		const scenario: string | null = route.parent.paramMap.get('scenario');
		const created: string | null = route.paramMap.get('created');
		if (scenario == null) throw new Error('null scenario');
		if (created == null) throw new Error('null created');
		const gameId: GameIdentifier = { scenario: scenario, created: created };
		return gameId;
	}

	private subscribeToGame(): void {
		this.gameService.get(this.identifier).pipe(
			filter(game => !!game),
			map((game: Game | null) => game as Game)
		).subscribe(game => this.game = game);
	}

}
