import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Observable, of } from 'rxjs';

import { PlayerComponent } from './player.component';
import { PlayerService } from '../player.service';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

describe('PlayerComponent', () => {
    let component: PlayerComponent;
    let fixture: ComponentFixture<PlayerComponent>;

    beforeEach(async(() => {
        const playerServiceStub = jasmine.createSpyObj('PlayerService', ['getPlayer']);
        playerServiceStub.getPlayer.and.returnValue( of({ username: 'Administrator' }) );

        TestBed.configureTestingModule({
            declarations: [PlayerComponent],
            providers: [{
                provide: ActivatedRoute,
                useValue: {
                    params: of({ username: 'Administrator' }),
                    snapshot: {
                        paramMap: convertToParamMap({ username: 'Administrator' })
                    }
                }
            },
            { provide: PlayerService, useValue: playerServiceStub }]
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
