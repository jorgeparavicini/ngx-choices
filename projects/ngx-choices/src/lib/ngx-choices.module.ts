import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Options } from 'choices.js';
import { ChoicesComponent } from './choices.component';
import { NgxChoicesService } from './ngx-choices.service';

@NgModule({
  declarations: [ChoicesComponent],
  imports: [CommonModule],
  exports: [ChoicesComponent],
})
export class NgxChoicesModule {
  public static forRoot(
    config?: Partial<Options>
  ): ModuleWithProviders<NgxChoicesModule> {
    return {
      ngModule: NgxChoicesModule,
      providers: [{ provide: NgxChoicesService, useValue: config }],
    };
  }
}
