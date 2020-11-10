import { Component } from '@angular/core';

import { SelfService } from './self.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
	
	constructor(
		private readonly selfService: SelfService
		){}
}
