import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AddUserComponent } from './add-user/add-user.component';
import { GameComponent } from './game/game.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ScenarioComponent } from './scenario/scenario.component';
import { ScenariosComponent } from './scenarios/scenarios.component';
import { UserComponent } from './user/user.component';
import { UsersComponent } from './users/users.component';

/*
 * AuthGuard enforces that the user must be authenticated and have all the roles in the data.roles array,
 * if data.roles is not empty.
 */
const routes: Routes = [
	{
		path: 'scenario/:scenario/game/:created',
		component: GameComponent
	},
	{
		path: 'scenario/:id',
		component: ScenarioComponent
	},
	{
		path: 'scenario',
		component: ScenariosComponent
	},
	{
		path: 'user/:username',
		component: UserComponent
	},
	{
		path: 'login',
		component: LoginComponent
	},
	{
		path: 'user?add',
		component: AddUserComponent
	},
	{
		path: 'user',
		component: UsersComponent
	},
	{
		path: '',
		component: HomeComponent,
		pathMatch: 'full'
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [
		RouterModule
	]
})
export class AppRoutingModule { }
