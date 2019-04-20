import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayerComponent } from './player/player.component';
import { PlayersComponent } from './players/players.component';

const routes: Routes = [
    { path: 'player', component: PlayersComponent, pathMatch: 'full' },
    { path: 'player/:username', component: PlayerComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
