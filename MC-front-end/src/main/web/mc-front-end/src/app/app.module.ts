import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { WINDOW_PROVIDER } from './window.provider';

import { AbstractGamePlayersService } from './service/abstract.game-players.service';
import { AbstractMayJoinGameService } from './service/abstract.may-join-game.service';
import { AbstractSelfService } from './service/abstract.self.service';
import { AbstractGameBackEndService } from './service/abstract.game.back-end.service';
import { AbstractUserBackEndService } from './service/abstract.user.back-end.service';
import { GamePlayersService } from './service/game-players.service';
import { HttpGameBackEndService } from './service/http.game.back-end.service';
import { HttpUserBackEndService } from './service/http.user.back-end.service';
import { MayJoinGameService } from './service/may-join-game.service';
import { SelfService } from './service/self.service';

import { AddUserComponent } from './add-user/add-user.component';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { GamesComponent } from './games/games.component';
import { GamePlayersComponent } from './game-players/game-players.component';
import { LoginComponent } from './login/login.component';
import { ScenarioComponent } from './scenario/scenario.component';
import { ScenariosComponent } from './scenarios/scenarios.component';
import { UserComponent } from './user/user.component';
import { UsersComponent } from './users/users.component';
import { HomeComponent } from './home/home.component';
import { SelfComponent } from './self/self.component';


@NgModule({
	imports: [
		BrowserModule,
		CommonModule,
		FormsModule,
		AppRoutingModule,
		HttpClientModule,
		RouterModule
	],
	declarations: [
		AddUserComponent,
		AppComponent,
		HomeComponent,
		GameComponent,
		GamesComponent,
		GamePlayersComponent,
		LoginComponent,
		ScenarioComponent,
		ScenariosComponent,
		SelfComponent,
		UsersComponent,
		UserComponent
	],
	providers: [
		WINDOW_PROVIDER,
		{ provide: AbstractGamePlayersService, useClass: GamePlayersService },
		{ provide: AbstractSelfService, useClass: SelfService },
		{ provide: AbstractGameBackEndService, useClass: HttpGameBackEndService },
		{ provide: AbstractMayJoinGameService, useClass: MayJoinGameService },
		{ provide: AbstractUserBackEndService, useClass: HttpUserBackEndService }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
