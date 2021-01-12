import { Observable, combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, flatMap, map } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

	constructor(
		private route: ActivatedRoute,
		private gameService: GameService
	) { }



	get scenario$(): Observable<string> {
		if (!this.route.parent) throw new Error('missing this.route.parent');
		return this.route.parent.paramMap.pipe(
			map(params => params.get('scenario')),
			filter(scenario => !!scenario),
			map((id: string | null) => id as string)
		);
	};

	get created$(): Observable<string> {
		if (!this.route) throw new Error('missing this.route.parent');
		return this.route.paramMap.pipe(
			map(params => params.get('created')),
			filter(created => !!created),
			map((created: string | null) => created as string)
		);
	};

	private static createIdentifier(scenario: string, created: string) {
		return { scenario: scenario, created: created };
	}

	get identifier$(): Observable<GameIdentifier> {
		return combineLatest([this.scenario$, this.created$], GameComponent.createIdentifier).pipe(
			distinctUntilChanged() // don't spam identical values
		);
	};


	get game$(): Observable<Game> {
		return this.identifier$.pipe(
			flatMap(identifier => this.gameService.get(identifier)),
			filter(game => !!flatMap),
			map((flatMap: Game | null) => flatMap as Game)
		);
	}

	ngOnInit(): void {
		// Do nothing
	}

}
