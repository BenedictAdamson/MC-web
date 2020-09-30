import { Component, OnInit } from '@angular/core';

import { SelfService } from '../self.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	constructor(
		private readonly service: SelfService
	) { }

	ngOnInit(): void {
		this.username = this.service.username;
		this.password = this.service.password;
	}

	username: string = null;

	password: string = null;
}
