import { CommonModule } from '@angular/common';
import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
} from '@angular/core';
import { Options } from 'choices.js';
import { ChoicesComponent } from './choices.component';
import { NgxChoicesService } from './ngx-choices.service';

@NgModule({
  declarations: [ChoicesComponent],
  imports: [CommonModule],
  exports: [ChoicesComponent],
})
export class NgxChoicesModule {
  constructor(@Optional() @SkipSelf() parentModule?: NgxChoicesModule) {
    if (parentModule) {
      throw new Error(
        'NgxChoicesModule is already loaded. Import it once only'
      );
    }
  }

  public static forRoot(
    config?: Partial<Options>
  ): ModuleWithProviders<NgxChoicesModule> {
    return {
      ngModule: NgxChoicesModule,
      providers: [{ provide: NgxChoicesService, useValue: config }],
    };
  }
}
