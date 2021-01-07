import { Observable, combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, first, flatMap, map, tap } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AbstractGamePlayersService } from '../service/abstract.game-players.service';
import { AbstractMayJoinGameService } from '../service/abstract.may-join-game.service';
import { AbstractSelfService } from '../service/abstract.self.service';
import { GameIdentifier } from '../game-identifier';
import { GamePlayers } from '../game-players';

@Component({
	selector: 'app-game',
	templateUrl: './game-players.component.html',
	styleUrls: ['./game-players.component.css']
})
export class GamePlayersComponent implements OnInit {

	private get scenario$(): Observable<string> {
		if (!this.route.parent) throw new Error('missing this.route.parent');
		if (!this.route.parent.parent) throw new Error('missing this.route.parent.parent');
		return this.route.parent.parent.paramMap.pipe(
			map(params => params.get('scenario')),
			filter(scenario => !!scenario),
			map((id: string | null) => id as string)
		);
	};

	private get created$(): Observable<string> {
		if (!this.route.parent) throw new Error('missing this.route.parent');
		return this.route.parent.paramMap.pipe(
			map(params => params.get('created')),
			filter(created => !!created),
			map((created: string | null) => created as string)
		);
	};

	private static createIdentifier(scenario: string, created: string) {
		return { scenario: scenario, created: created };
	}

	get identifier$(): Observable<GameIdentifier> {
		return combineLatest([this.scenario$, this.created$], GamePlayersComponent.createIdentifier).pipe(
			distinctUntilChanged() // don't spam identical values
		);
	};

	get gamePlayers$(): Observable<GamePlayers> {
		return this.identifier$.pipe(
			flatMap(identifier => this.gamePlayersService.getGamePlayers(identifier)),
			filter(gps => !!gps),
			map((gps: GamePlayers | null) => gps as GamePlayers)
		);
	}

	constructor(
		private route: ActivatedRoute,
		private gamePlayersService: AbstractGamePlayersService,
		private mayJoinGameService: AbstractMayJoinGameService,
		private selfService: AbstractSelfService
	) {
	}

	ngOnInit(): void {
		// Do nothing
	}


	get playing$(): Observable<boolean> {
		return combineLatest([this.selfService.id$, this.gamePlayers$], (id: string, gamePlayers: GamePlayers) => {
			return gamePlayers.users.includes(id)
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
			flatMap(identifier => this.gamePlayersService.mayJoinGame(identifier)),
			distinctUntilChanged() // don't spam identical values
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
			map(gp => gp.users)
			// TODO provide names
		);
	}

	endRecruitment() {
		this.identifier$.pipe(
			first(),// do the operation only once
			tap(id => this.gamePlayersService.endRecruitment(id))
		).subscribe();
	}

	joinGame() {
		this.identifier$.pipe(
			first(),// do the operation only once
			tap(id => this.gamePlayersService.joinGame(id))
		).subscribe();
	}

}
