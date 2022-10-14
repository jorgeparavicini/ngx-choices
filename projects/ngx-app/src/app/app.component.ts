import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public title = 'ngx-app';

  public label = 'Hello';

  public control = new FormControl('Option 2');
  public control2 = new FormControl('Option 2');

  public choices = [
    {
      value: 'Option 1',
      label: 'Option 1',
      selected: true,
      disabled: false,
    },
    {
      value: 'Option 2',
      label: 'Option 2',
      selected: false,
      disabled: false,
      customProperties: {
        description: 'Custom description about Option 2',
        random: 'Another random custom property',
      },
    },
  ];
}
