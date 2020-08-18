import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './player/player.component';
import { UsersComponent } from './players/players.component';

const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: 'player', component: UsersComponent, pathMatch: 'full' },
    { path: 'player/:username', component: UserComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
