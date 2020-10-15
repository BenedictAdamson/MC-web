import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AddUserComponent } from './add-user/add-user.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { ScenariosComponent } from './scenarios/scenarios.component';
import { UserComponent } from './user/user.component';
import { UsersComponent } from './users/users.component';
import { WINDOW_PROVIDER } from './window.provider';
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
		ScenariosComponent,
		SelfComponent,
		UsersComponent,
		UserComponent
	],
	providers: [
		WINDOW_PROVIDER
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
