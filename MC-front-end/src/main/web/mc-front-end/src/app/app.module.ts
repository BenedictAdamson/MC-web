import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { UserComponent } from './user/user.component';
import { UsersComponent } from './users/users.component';
import { WINDOW_PROVIDER } from './window.provider';
import { HomeComponent } from './home/home.component';
import { SelfComponent } from './self/self.component';

@NgModule({
	imports: [
		BrowserModule,
		CommonModule,
		AppRoutingModule,
		HttpClientModule,
		RouterModule
	],
	declarations: [
		AppComponent,
		HomeComponent,
		UsersComponent,
		UserComponent
	],
	providers: [
		WINDOW_PROVIDER
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
