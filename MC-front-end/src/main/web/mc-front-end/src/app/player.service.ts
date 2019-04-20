import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Player } from './player';

@Injectable({
    providedIn: 'root'
})
export class PlayerService {

    private players: Player[] = [{ username: 'Administrator', password: null, authorities: ['ROLE_ADMIN'] }];

    constructor() { }

    getPlayers(): Observable<Player[]> {
        return of(this.players);
    }
}
