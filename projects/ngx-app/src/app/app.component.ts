import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Choice } from 'choices.js';
import { BehaviorSubject, delay, Observable, of, tap } from 'rxjs';

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

  public loading$ = new BehaviorSubject(false);

  public choices$ = of([{ value: 'value', label: 'label' }]).pipe(
    tap(() => this.loading$.next(true)),
    delay(2000),
    tap(() => this.loading$.next(false))
  );

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

  public getChoices(searchValue: string): Observable<Choice[]> {
    console.log('Fetching');
    return of([
      {
        value: searchValue + 'sda',
        label: searchValue + ' sad',
      },
    ]).pipe(delay(1000));
  }
}
