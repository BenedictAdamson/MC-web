import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';

import { AbstractUserBackEndService } from './abstract.user.back-end.service';
import { HttpKeyValueService } from './http.key-value.service';
import { User } from '../user';
import { UserDetails } from '../user-details';


export const apiUsersPath: string = '/api/user';

export function getApiUserPath(id: string): string {
	return apiUsersPath + '/' + id;
}


class Delegate extends HttpKeyValueService<string, User, UserDetails> {

	constructor(
		http: HttpClient
	) {
		super(http, apiUsersPath, apiUsersPath);
	}

	getUrl(id: string): string {
		return getApiUserPath(id);
	}

	getAll(): Observable<User[]> {
		return super.getAll() as Observable<User[]>;// is not undefined
	}

	add(specification: UserDetails): Observable<User> {
		return super.add(specification) as Observable<User>;// is not undefined
	}

}// class


export class HttpUserBackEndService extends AbstractUserBackEndService {

	private delegate: Delegate;


	constructor(
		http: HttpClient
	) {
		super();
		this.delegate = new Delegate(http)
	}


	getAll(): Observable<User[]> {
		return this.delegate.getAll() as Observable<User[]>;
	}

	get(id: string): Observable<User | null> {
		return this.delegate.get(id);
	}

	add(specification: UserDetails): Observable<User> {
		return this.delegate.add(specification) as Observable<User>;
	}

}// class

