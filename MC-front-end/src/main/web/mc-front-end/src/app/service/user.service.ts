import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

import { AbstractUserBackEndService } from './abstract.user.back-end.service';
import { CachingKeyValueService } from './caching.key-value.service';
import { User } from '../user';
import { UserDetails } from '../user-details';


@Injectable({
	providedIn: 'root'
})
export class UserService extends CachingKeyValueService<string, User, UserDetails> {

	constructor(
		backEnd: AbstractUserBackEndService
	) {
		super(backEnd);
	}


	getAll(): Observable<User[]> {
		return super.getAll() as Observable<User[]>;
	}

	add(specification: UserDetails): Observable<User> {
		return super.add(specification) as Observable<User>;
	}


	protected createKeyString(id: string): string {
		return id;
	}

	protected getKey(value: User): string {
		return value.id;
	}

}
