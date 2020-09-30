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
		//FIXME get service values
	}

	username: string;

	password: string;
}
