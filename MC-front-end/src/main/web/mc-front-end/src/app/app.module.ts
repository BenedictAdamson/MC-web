import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { WINDOW_PROVIDERS } from './window-providers';
import { KEYCLOAK_PROVIDERS } from './keycloak-init';
import { UserComponent } from './user/user.component';
import { UsersComponent } from './users/users.component';
import { HomeComponent } from './home/home.component';
import { SelfComponent } from './self/self.component';

@NgModule({
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		RouterModule
	],
	declarations: [
		AppComponent,
		UsersComponent,
		UserComponent,
		HomeComponent,
		SelfComponent
	],
	providers: [
		WINDOW_PROVIDERS,
		KEYCLOAK_PROVIDERS
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
