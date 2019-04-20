import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Observable, of } from 'rxjs';

import { Player } from '../player';
import { PlayerComponent } from './player.component';
import { PlayerService } from '../player.service';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

describe('PlayerComponent', () => {
    let component: PlayerComponent;
    let fixture: ComponentFixture<PlayerComponent>;

    const PLAYER_A = { username: 'Administrator', password: null, authorities: ['ROLE_ADMIN'] };
    const PLAYER_B = { username: 'Benedict', password: null, authorities: [] };

    const canCreate = (testPlayer: Player) => {
        const playerServiceStub = jasmine.createSpyObj('PlayerService', ['getPlayer']);
        playerServiceStub.getPlayer.and.returnValue(of(testPlayer));

        TestBed.configureTestingModule({
            declarations: [PlayerComponent],
            providers: [{
                provide: ActivatedRoute,
                useValue: {
                    params: of({ username: testPlayer.username }),
                    snapshot: {
                        paramMap: convertToParamMap({ username: testPlayer.username })
                    }
                }
            },
            { provide: PlayerService, useValue: playerServiceStub }]
        });

        fixture = TestBed.createComponent(PlayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(component.player).toBe(testPlayer);
    };
    it('can create [a]', () => {
        canCreate(PLAYER_A);
    });
    it('can create [b]', () => {
        canCreate(PLAYER_B);
    });
});
