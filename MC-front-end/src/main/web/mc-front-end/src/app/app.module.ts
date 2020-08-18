import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { UserComponent } from './user/user.component';
import { UsersComponent } from './users/users.component';
import { HomeComponent } from './home/home.component';

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
        HomeComponent
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
