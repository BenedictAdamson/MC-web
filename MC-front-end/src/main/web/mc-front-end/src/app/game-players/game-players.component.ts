import { Observable, ReplaySubject } from 'rxjs';
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

	private mayJoinGameRS$: ReplaySubject<boolean> = new ReplaySubject(1);

	identifier: GameIdentifier;
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

	isPlaying(): boolean {
		return this.selfService.id != null && this.gamePlayers.users.includes(this.selfService.id);
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
