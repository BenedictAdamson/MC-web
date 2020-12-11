import { Observable, ReplaySubject, combineLatest } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

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

	private mayJoinGameRS$: ReplaySubject<boolean> = new ReplaySubject(1);

	identifier: GameIdentifier;

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
			flatMap(identifier => this.gamePlayersService.getGamePlayers(this.identifier))
		);
	}
	gamePlayers: GamePlayers;

	constructor(
		private route: ActivatedRoute,
		private gamePlayersService: GamePlayersService,
		private selfService: SelfService
	) {
		this.mayJoinGameRS$.next(false);
	}

	ngOnInit(): void {
		this.identifier = this.getGameIdentifier();
		if (!this.identifier) throw new Error('unknown this.identifier');
		this.gamePlayersService.getGamePlayers(this.identifier)
			.subscribe(gamePlayers => this.gamePlayers = gamePlayers);
		this.gamePlayersService.mayJoinGame(this.identifier).subscribe(
			may => this.mayJoinGameRS$.next(may)
		);
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

	get playing$(): Observable<boolean> {
		return this.selfService.id$.pipe(
			map(id => id != null && this.gamePlayers.users.includes(id))
		);
	}

	isEndRecruitmentDisabled$(): Observable<boolean> {
		return this.selfService.mayManageGames$.pipe(
			map(mayManage => this.gamePlayers && (!this.gamePlayers.recruiting || !mayManage))
		);
	}

	isJoinDisabled$(): Observable<boolean> {
		return this.mayJoinGame$().pipe(
			map(may => !may)
		);
	}

	mayJoinGame$(): Observable<boolean> {
		return this.mayJoinGameRS$.asObservable();
	}

	get nPlayers(): number {
		if (this.gamePlayers) {
			return this.gamePlayers.users.length;
		} else {
			return 0;
		}
	}

	get players(): string[] {
		if (this.gamePlayers) {
			return this.gamePlayers.users.map(id => id);// TODO provide names
		} else {
			return [];
		}
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
