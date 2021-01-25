import { Observable } from 'rxjs';

import { AbstractKeyValueService } from './abstract.key-value.service'
import { User } from '../user';
import { UserDetails } from '../user-details';


export abstract class AbstractUserBackEndService extends AbstractKeyValueService<string, User, UserDetails> {

	abstract getAll(): Observable<User[]>;

	abstract get(id: string): Observable<User | null>;

	abstract add(specification: UserDetails): Observable<User>;

}
