import { v4 as uuid, parse as parseUuid } from 'uuid';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppRoutingModule } from '../app-routing.module';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { GameService } from '../game.service';
import { SelfService } from '../self.service';

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
		private selfService: SelfService,
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
	 * @description
     * Whether the current user has permission to manage (create and remove) games.
     *
     * A user that has not been authenticated does not have that permission.
	 */
	get mayManageGames$(): Observable<boolean> {
		return this.selfService.authorities$.pipe(
			map(authorities => authorities.includes('ROLE_MANAGE_GAMES'))
		);
	}

	/**
     * Attempts to create a new game for the scenario of this games list.
     * On completion, redirects to the the game page for that game.
	 */
	createGame(): void {
		this.gameService.createGame(this.scenario).subscribe(
			game => this.router.navigateByUrl(AppRoutingModule.getGamePath(game.identifier))
		);
	}
}
