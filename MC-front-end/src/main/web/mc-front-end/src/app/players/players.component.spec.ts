import { of } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Player } from '../player';
import { PlayersComponent } from './players.component';
import { PlayerService } from '../player.service';

describe('PlayersComponent', () => {
    let component: PlayersComponent;
    let fixture: ComponentFixture<PlayersComponent>;

    const PLAYER_A = { username: 'Administrator', password: null, authorities: ['ROLE_ADMIN'] };
    const PLAYER_B = { username: 'Benedict', password: null, authorities: [] };

    const setUp = (testPlayers: Player[]) => {
        const playerServiceStub = jasmine.createSpyObj('PlayerService', ['getPlayers']);
        playerServiceStub.getPlayers.and.returnValue(of(testPlayers));

        TestBed.configureTestingModule({
            declarations: [PlayersComponent],
            imports: [RouterTestingModule],
            providers: [
                { provide: PlayerService, useValue: playerServiceStub }]
        });

        fixture = TestBed.createComponent(PlayersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    };

    const canCreate = (testPlayers: Player[]) => {
        setUp(testPlayers);

        expect(component).toBeTruthy();
        expect(component.players).toBe(testPlayers);
    };

    it('can create [1]', () => {
        canCreate([PLAYER_A]);
    });

    it('can create [2]', () => {
        canCreate([PLAYER_A, PLAYER_B]);
    });
});
