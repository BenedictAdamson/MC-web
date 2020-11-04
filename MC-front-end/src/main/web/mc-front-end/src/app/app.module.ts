import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { WINDOW_PROVIDER } from './window.provider';

import { AddUserComponent } from './add-user/add-user.component';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
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
		LoginComponent,
		ScenarioComponent,
		ScenariosComponent,
		SelfComponent,
		UsersComponent,
		UserComponent,
		GameComponent
	],
	providers: [
		WINDOW_PROVIDER
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
