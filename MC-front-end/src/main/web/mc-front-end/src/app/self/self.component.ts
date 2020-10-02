import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SelfService } from '../self.service';

@Component({
	selector: 'app-self',
	templateUrl: './self.component.html',
	styleUrls: ['./self.component.css']
})
export class SelfComponent implements OnInit {

	constructor(
		private readonly service: SelfService) {
	}

	ngOnInit(): void {
		// Do nothing
	}

	get username(): string { return this.service.username; };

	authenticated$: Observable<boolean> = this.service.authenticated$;

}
