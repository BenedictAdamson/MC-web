import { APP_INITIALIZER, FactoryProvider } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

/**
 * @description
 * Initialize the Keycloak service.
 * This module assumes that the Keycloak service is accessible at path '/auth'
 * on the same server and port as the application
 * (which in practice requires a reverse HTTP proxy to map the Keycloak URL to '/auth').
 * It also assumes that the Keycloak realm is 'mc' and the Keycloak client ID is 'mc-ui'.)
 *
 * @exports
 * Exports an array of FactoryProvider objects, KEY_PROVIDERS,
 * for use in the providers list of the application @NgModue,
 * to automaticaly initialize the Keycloak service.
 *
 */

const keyCloakConfig = {
	realm: "MC",
	clientId: "mc-ui"
};



function initializeKeycloakService(keycloak: KeycloakService, window: Window): () => Promise<any> {
	return (): Promise<any> => {
		return new Promise(async (resolve, reject) => {
			try {
				var location = window.location;
				var baseUrl = location.protocol + '://' + location.hostname + ':' + location.port;
				var keyCloakUrl = baseUrl + '/auth';
				await keycloak.init({
					config: {
						url: keyCloakUrl,
						realm: keyCloakConfig.realm,
						clientId: keyCloakConfig.clientId
					},
					loadUserProfileAtStartUp: false,
					initOptions: {
						onLoad: 'login-required',
						checkLoginIframe: true
					},
					bearerExcludedUrls: []
				});
				resolve(keycloak);
			} catch (error) {
				reject(error);
			}
		});
	};
}



export const KEYCLOAK_INITIALIZER: FactoryProvider = {
	provide: APP_INITIALIZER,
	useFactory: initializeKeycloakService,
	/**
	* A list of `token`s to be resolved by the injector. The list of values is then
	* used as arguments to the `useFactory` function.
	*/
	deps: [KeycloakService, Window],
	multi: true
};
