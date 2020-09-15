import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class SelfService {

    /**
     * @description
     * Initial state:
     * not ##isLoggedIn()
     */
	constructor() { }

    /**
     * @returns
     * null if the user name is unknown,
     * which includes the case that the user is not logged in.
     */
	getUsername(): string {
		return null;
	};

    /**
     * @description
     * #isLoggedIn() iff #getUsername() is non null.
     */
	isLoggedIn(): boolean {
		return this.getUsername() != null;
	}
}
