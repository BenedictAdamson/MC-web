import { v4 as uuid } from 'uuid';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

import { Game } from '../game'
import { GameIdentifier } from '../game-identifier'
import { GameService } from '../game.service';

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

	game: Game;

	constructor(
		private route: ActivatedRoute,
		private gameService: GameService
	) { }

	ngOnInit(): void {
		this.getGame(this.getGameIdentifier());
	}


	private getGameIdentifier(): GameIdentifier {
		const route: ActivatedRouteSnapshot = this.route.snapshot;
		const scenario: uuid = route.parent.paramMap.get('scenario');
		const created: string = route.paramMap.get('created');
		if (scenario == null) throw new Error('null scenario');
		if (created == null) throw new Error('null created');
		const gameId: GameIdentifier = { scenario: scenario, created: created };
		return gameId;
	}

	private getGame(id: GameIdentifier): void {
		this.gameService.getGame(id)
			.subscribe(game => this.game = game);
	}

}
