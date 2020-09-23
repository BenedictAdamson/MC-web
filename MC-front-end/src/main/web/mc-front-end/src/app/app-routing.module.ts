import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';
import { UsersComponent } from './users/users.component';

/*
 * AuthGuard enforces that the user must be authenticated and have all the roles in the data.roles array,
 * if data.roles is not empty.
 */
const routes: Routes = [
	{
		path: '',
		component: HomeComponent,
		pathMatch: 'full'
	},
	{
		path: 'user',
		component: UsersComponent,
		pathMatch: 'full'
	},
	{
		path: 'user/:username',
		component: UserComponent,
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
