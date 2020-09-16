import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { WINDOW_PROVIDERS } from './window-providers';
import { KEYCLOAK_PROVIDERS } from './keycloak-init';
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
		SelfComponent
	],
	providers: [
		WINDOW_PROVIDERS,
		KEYCLOAK_PROVIDERS
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
