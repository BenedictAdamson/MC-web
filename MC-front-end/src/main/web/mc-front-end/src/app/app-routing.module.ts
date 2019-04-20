import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayersComponent } from './players/players.component';

const routes: Routes = [
    { path: 'player', component: PlayersComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
