import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

import { GameIdentifier } from '../game-identifier';
import { GamePlayers } from '../game-players';
import { GamePlayersService } from '../game-players.service';
import { SelfService } from '../self.service';

@Component({
	selector: 'app-game',
	templateUrl: './game-players.component.html',
	styleUrls: ['./game-players.component.css']
})
export class GamePlayersComponent implements OnInit {

	identifier: GameIdentifier;
	gamePlayers: GamePlayers;

	constructor(
		private route: ActivatedRoute,
		private gamePlayersService: GamePlayersService,
		private selfService: SelfService
	) { }

	ngOnInit(): void {
		this.identifier = this.getGameIdentifier();
		this.subscribeToGamePlayers();
	}


	private getGameIdentifier(): GameIdentifier {
		const route: ActivatedRouteSnapshot = this.route.snapshot;
		const scenario: uuid = route.parent.parent.paramMap.get('scenario');
		const created: string = route.parent.paramMap.get('created');
		if (!scenario) throw new Error('unknown scenario');
		if (!created) throw new Error('unknown created');
		const gameId: GameIdentifier = { scenario: scenario, created: created };
		return gameId;
	}

	private subscribeToGamePlayers(): void {
		if (!this.identifier) throw new Error('unknown this.identifier');
		this.gamePlayersService.getGamePlayers(this.identifier)
			.subscribe(gamePlayers => this.gamePlayers = gamePlayers);
	}

	isEndRecruitmentDisabled$(): Observable<boolean> {
		return this.selfService.mayManageGames$.pipe(
			map(mayManage => this.gamePlayers && (!this.gamePlayers.recruiting || !mayManage))
		);
	}

	mayJoinGame$(): Observable<boolean> {
		return this.gamePlayersService.mayJoinGame(this.identifier);
	}

	endRecuitment() {
		if (!this.identifier) throw new Error('unknown this.identifier');
		this.gamePlayersService.endRecuitment(this.identifier).subscribe(gamePlayers => this.gamePlayers = gamePlayers);
	}

	joinGame() {
		if (!this.identifier) throw new Error('unknown this.identifier');
		this.gamePlayersService.joinGame(this.identifier).subscribe(gamePlayers => this.gamePlayers = gamePlayers);
	}

}
