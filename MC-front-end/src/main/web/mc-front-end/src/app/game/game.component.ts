import { Observable, combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, map, mergeMap } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Game } from '../game';
import { GameIdentifier } from '../game-identifier';
import { GameService } from '../service/game.service';

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

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
			mergeMap(identifier => this.gameService.get(identifier)),
			filter(game => !!game),
			map((game: Game | null) => game as Game)
		);
	}

	ngOnInit(): void {
		// Do nothing
	}

}
