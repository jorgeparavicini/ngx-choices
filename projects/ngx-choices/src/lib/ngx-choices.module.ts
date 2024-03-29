import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ChoicesDirective } from './choices.directive';
import { NgxChoicesService } from './ngx-choices.service';
import { ChoiceOptions } from './types.model';

@NgModule({
  declarations: [ChoicesDirective],
  imports: [CommonModule],
  exports: [ChoicesDirective],
})
export class NgxChoicesModule {
  public static forRoot(
    config?: Partial<ChoiceOptions>
  ): ModuleWithProviders<NgxChoicesModule> {
    return {
      ngModule: NgxChoicesModule,
      providers: [{ provide: NgxChoicesService, useValue: config }],
    };
  }
}
