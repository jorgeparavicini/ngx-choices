import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Options } from 'choices.js';

@Injectable({ providedIn: 'root' })
export class NgxChoicesConfig {
  public config: Partial<Options>;

  constructor(
    @Optional() @Inject(NgxChoicesService) config?: Partial<Options>
  ) {
    this.config = config ?? {};
  }
}

export const NgxChoicesService = new InjectionToken<Partial<Options>>(
  'ngx-choices.config'
);
