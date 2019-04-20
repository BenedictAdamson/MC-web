import { Injectable } from '@angular/core';
import { Player } from './player';

@Injectable({
    providedIn: 'root'
})
export class PlayerService {

    private players: Player[] = [{ username: 'Administrator', password: null, authorities: ['ROLE_ADMIN'] }];

    constructor() { }

    getPlayers(): Player[] {
        return this.players;
    }
}
