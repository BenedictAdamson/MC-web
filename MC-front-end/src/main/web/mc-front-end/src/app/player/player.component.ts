import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlayerService } from '../player.service';
import { Player } from '../player';

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {

    player: Player;

    constructor(
        private route: ActivatedRoute,
        private playerService: PlayerService) { }

    ngOnInit() {
        this.getPlayer();
    }


    getPlayer(): void {
        const username = this.route.snapshot.paramMap.get('username');
        this.playerService.getPlayer(username)
            .subscribe(player => this.player = player);
    }
}
