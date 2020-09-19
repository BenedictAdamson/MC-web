import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { WINDOW_PROVIDER } from './window-providers';
import { KEYCLOAK_PROVIDER } from './keycloak-init';
import { HomeComponent } from './home/home.component';
import { SelfComponent } from './self/self.component';

@NgModule({
	imports: [
		BrowserModule,
		CommonModule,
		AppRoutingModule,
		HttpClientModule,
		RouterModule,
		KeycloakAngularModule
	],
	declarations: [
		AppComponent,
		HomeComponent,
		SelfComponent
	],
	providers: [
		WINDOW_PROVIDER,
		KEYCLOAK_PROVIDER
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
