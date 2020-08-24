import { InjectionToken, FactoryProvider } from '@angular/core';

// Enable runtime access to the "window" global variable
 
export const WINDOW = new InjectionToken<Window>('window');

const windowProvider: FactoryProvider = {
  provide: WINDOW,
  useFactory: () => window
};

export const WINDOW_PROVIDERS = [
    windowProvider
]
