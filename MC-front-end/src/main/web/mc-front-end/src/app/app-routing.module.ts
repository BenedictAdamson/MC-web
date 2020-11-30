import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AddUserComponent } from './add-user/add-user.component';
import { GameComponent } from './game/game.component';
import { GamesComponent } from './games/games.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ScenarioComponent } from './scenario/scenario.component';
import { ScenariosComponent } from './scenarios/scenarios.component';
import { UserComponent } from './user/user.component';
import { UsersComponent } from './users/users.component';

const routes: Routes = [
	{
		path: 'scenario',
		children: [
			{
				path: ':scenario',
				component: ScenarioComponent,
				children: [
					{
						path: 'game/:created',
						component: GameComponent
					},
					{
						path: '',
						pathMatch: 'full',
						component: GamesComponent
					}
				]
			},
			{
				path: '',
				pathMatch: 'full',
				component: ScenariosComponent
			}]
	},
	{
		path: 'user/:id',
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
export class AppRoutingModule {
}
