import { InjectionToken, FactoryProvider } from '@angular/core';

// Enable runtime access to the "window" global variable

export const WINDOW = new InjectionToken<Window>('window');

export const WINDOW_PROVIDER: FactoryProvider = {
	provide: WINDOW,
	useFactory: () => window
};
