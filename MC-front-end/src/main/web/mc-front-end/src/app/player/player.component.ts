import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { PlayerService } from '../player.service';
import { Player } from '../player';

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {

    @Input() player: Player;

    constructor(
        private route: ActivatedRoute,
        private playerService: PlayerService,
        private location: Location) { }

    ngOnInit() {
        this.getPlayer();
    }


    getPlayer(): void {
        const username = this.route.snapshot.paramMap.get('username');
        this.playerService.getPlayer(username)
            .subscribe(player => this.player = player);
    }
}
