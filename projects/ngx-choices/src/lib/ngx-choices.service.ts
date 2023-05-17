import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { ChoiceOptions } from './types.model';

@Injectable({ providedIn: 'root' })
export class NgxChoicesConfig {
  public config: Partial<ChoiceOptions>;

  constructor(
    @Optional() @Inject(NgxChoicesService) config?: Partial<ChoiceOptions>
  ) {
    this.config = config ?? {};
  }
}

export const NgxChoicesService = new InjectionToken<Partial<ChoiceOptions>>(
  'ngx-choices.config'
);
