import { Component } from '@angular/core';

import { SelfService } from './self.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {

	/**
	 * {@linkplain SelfService.checkForCurrentAuthentication Checks the server for current authentication information}.
     * That is, if the authentication system maintains sessions, and there is a current session,
     * the constructor will resume the current session.
     * This provides a better UX if the user refreshes their browser window,
     * because they will not then have to login again.
	 */
	constructor(
		private readonly selfService: SelfService
	) {
		this.checkForCurrentAuthentication();
	}

	private checkForCurrentAuthentication(): void {
		this.selfService.checkForCurrentAuthentication().subscribe();
	}
}
