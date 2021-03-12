import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AbstractUserBackEndService } from './abstract.user.back-end.service';
import { HttpSimpleKeyValueService } from './http.simple-key-value.service';
import { User } from '../user';
import { UserDetails } from '../user-details';


export const apiUsersPath = '/api/user';

export function getApiUserPath(id: string): string {
	return apiUsersPath + '/' + id;
}


class Delegate extends HttpSimpleKeyValueService<string, User, UserDetails, UserDetails> {

	constructor(
		http: HttpClient
	) {
		super(http, apiUsersPath);
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

	protected getAddUrl(_specification: UserDetails): string {
		return apiUsersPath;
	}

	protected getAddPayload(specification: UserDetails): UserDetails {
		return specification;
	}


}// class


@Injectable({
	providedIn: 'root'
})
export class HttpUserBackEndService extends AbstractUserBackEndService {

	private delegate: Delegate;


	constructor(
		http: HttpClient
	) {
		super();
		this.delegate = new Delegate(http);
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

