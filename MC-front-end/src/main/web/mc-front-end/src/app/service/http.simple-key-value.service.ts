import { HttpClient } from '@angular/common/http';

import { HttpKeyValueService } from './http.key-value.service';

export abstract class HttpSimpleKeyValueService<KEY, VALUE, SPECIFICATION, ADDPAYLOAD>
	extends HttpKeyValueService<KEY, VALUE, VALUE, SPECIFICATION, ADDPAYLOAD> {


	protected constructor(
		protected http: HttpClient,
		public allUrl: string | undefined
	) {
		super(http, allUrl);
	}

	protected decode(encodedValue: VALUE): VALUE {
		return encodedValue;// no decoding necessary
	}

}
