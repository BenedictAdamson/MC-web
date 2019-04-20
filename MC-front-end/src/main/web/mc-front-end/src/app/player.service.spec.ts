import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { PlayerService } from './player.service';
import { Player } from './player';

describe('PlayerService', () => {
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });

        /* Inject for each test:
         * HTTP requests will be handled by the mock back-end.
          */
        httpClient = TestBed.get(HttpClient);
        httpTestingController = TestBed.get(HttpTestingController);
    });

    it('should be created', () => {
        const service: PlayerService = TestBed.get(PlayerService);
        expect(service).toBeTruthy();
    });

    it('can get players', () => {
        const testPlayers: Player[] = [{ username: 'Administrator', password: null, authorities: ['ROLE_ADMIN'] }];
        const service: PlayerService = TestBed.get(PlayerService);

        service.getPlayers().subscribe(players => expect(players).toEqual(testPlayers));

        const request = httpTestingController.expectOne('/api/player');
        expect(request.request.method).toEqual('GET');
        request.flush(testPlayers);
        httpTestingController.verify();
    });
});
