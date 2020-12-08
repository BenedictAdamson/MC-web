import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

import { Game } from '../game';
import { GameIdentifier } from '../game-identifier';
import { GameService } from '../game.service';
import { GamesComponent } from '../games/games.component';
import { SelfService } from '../self.service';

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
		private gameService: GameService,
		private selfService: SelfService
	) { }

	ngOnInit(): void {
		this.identifier = this.getGameIdentifier();
		this.subscribeToGame();
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

	private subscribeToGame(): void {
		this.gameService.getGame(this.identifier)
			.subscribe(game => this.game = game);
	}

}
