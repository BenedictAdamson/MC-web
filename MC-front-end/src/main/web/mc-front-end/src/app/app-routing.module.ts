import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth-guard';
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
		pathMatch: 'full',
		canActivate: [AuthGuard],
		data: { roles: [] }
	},
	{
		path: 'user',
		component: UsersComponent,
		pathMatch: 'full',
		data: { roles: [] }
	},
	{
		path: 'user/:username',
		component: UserComponent,
		data: { roles: [] }
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [
		RouterModule
	]
})
export class AppRoutingModule { }
