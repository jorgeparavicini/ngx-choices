import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { NgxChoicesModule } from 'ngx-choices';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxChoicesModule.forRoot({ allowHTML: true })],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
