import { Observable, combineLatest } from 'rxjs';
import { first, flatMap, map, tap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GameIdentifier } from '../game-identifier';
import { GamePlayers } from '../game-players';
import { GamePlayersService } from '../service/game-players.service';
import { SelfService } from '../service/self.service';

@Component({
	selector: 'app-game',
	templateUrl: './game-players.component.html',
	styleUrls: ['./game-players.component.css']
})
export class GamePlayersComponent implements OnInit {

	private get scenario$(): Observable<uuid> {
		return this.route.parent.parent.paramMap.pipe(
			map(params => params.get('scenario'))
		);
	};

	private get created$(): Observable<string> {
		return this.route.parent.paramMap.pipe(
			map(params => params.get('created'))
		);
	};

	private static createIdentifier(scenario: uuid, created: string) {
		return { scenario: scenario, created: created };
	}

	get identifier$(): Observable<GameIdentifier> {
		return combineLatest([this.scenario$, this.created$], GamePlayersComponent.createIdentifier);
	};

	get gamePlayers$(): Observable<GamePlayers> {
		return this.identifier$.pipe(
			flatMap(identifier => this.gamePlayersService.getGamePlayers(identifier))
		);
	}

	constructor(
		private route: ActivatedRoute,
		private gamePlayersService: GamePlayersService,
		private selfService: SelfService
	) {
	}

	ngOnInit(): void {
		// Do nothing
	}


	get playing$(): Observable<boolean> {
		return combineLatest([this.selfService.id$, this.gamePlayers$], (id: uuid, gamePlayers: GamePlayers) => {
			return id && gamePlayers.users.includes(id)
		});
	}

	isEndRecruitmentDisabled$(): Observable<boolean> {
		return combineLatest([this.selfService.mayManageGames$, this.gamePlayers$],
			(mayManageGames: boolean, gamePlayers: GamePlayers) => {
				return !gamePlayers || !gamePlayers.recruiting || !mayManageGames;
			});
	}

	isJoinDisabled$(): Observable<boolean> {
		return this.mayJoinGame$().pipe(
			map(may => !may)
		);
	}

	mayJoinGame$(): Observable<boolean> {
		return this.identifier$.pipe(
			flatMap(identifier => this.gamePlayersService.mayJoinGame(identifier))
		);
	}

	get recruiting$(): Observable<boolean> {
		return this.gamePlayers$.pipe(
			map(gps => gps.recruiting)
		);
	}

	get nPlayers$(): Observable<number> {
		return this.gamePlayers$.pipe(
			map(gps => gps.users.length)
		);
	}

	get players$(): Observable<string[]> {
		return this.gamePlayers$.pipe(
			map(gp => gp.users),
			map((ids: uuid[]) => ids.map(id => id)) // TODO provide names
		);
	}

	endRecuitment() {
		this.identifier$.pipe(
			first(),// do the operation only once
			flatMap(id => this.gamePlayersService.endRecuitment(id)),
			tap((gp: GamePlayers) => this.gamePlayersService.updateGamePlayers(gp.identifier))
		).subscribe();
	}

	joinGame() {
		this.identifier$.pipe(
			first(),// do the operation only once
			flatMap(id => this.gamePlayersService.joinGame(id)),
			tap((gp: GamePlayers) => this.gamePlayersService.updateGamePlayers(gp.identifier))
		).subscribe();
	}

}
