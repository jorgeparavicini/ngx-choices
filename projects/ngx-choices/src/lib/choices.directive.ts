import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Choices, {
  Choice,
  ClassNames,
  DEFAULT_CLASSNAMES,
  Group,
  Choices as IChoices,
  Item,
  Options,
  PositionOptionsType,
  Types,
} from 'choices.js';
import Fuse from 'fuse.js';
import { Observable, Subscription } from 'rxjs';
import { NgxChoicesConfig } from './ngx-choices.service';
import {
  AddItemData,
  ChoiceData,
  HighlightChoiceData,
  HighlightItemData,
  RemoveItemData,
  SearchData,
  UnhighlightItemData,
} from './types.model';

type Callback = (value: unknown) => void;

@Directive({
  selector: '[ngxChoice]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChoicesDirective),
      multi: true,
    },
  ],
  exportAs: 'ngxChoice',
})
export class ChoicesDirective
  implements OnInit, OnChanges, OnDestroy, ControlValueAccessor, AfterViewInit
{
  private instance!: Choices;

  private onChange?: Callback;

  private subscriptions: Subscription[] = [];
  private inputElement?: HTMLInputElement;

  private get type(): 'text' | 'select-one' | 'select-multiple' {
    return this.element.nativeElement.type;
  }

  //#region Inputs

  /**
   * Optionally suppress console errors and warnings.
   *
   * **Input types affected:** text, select-single, select-multiple
   *
   * @default false
   */
  @Input()
  public silent?: boolean;

  /**
   * Add pre-selected items (see terminology) to text input.
   *
   * **Input types affected:** text
   *
   * @example
   * ```
   * ['value 1', 'value 2', 'value 3']
   * ```
   *
   * @example
   * ```
   * [{
   *    value: 'Value 1',
   *    label: 'Label 1',
   *    id: 1
   *  },
   *  {
   *    value: 'Value 2',
   *    label: 'Label 2',
   *    id: 2,
   *    customProperties: {
   *      random: 'I am a custom property'
   *  }
   * }]
   * ```
   *
   * @default []
   */
  @Input()
  public items?: string[] | Choice[];

  /**
   * Add choices (see terminology) to select input.
   *
   * **Input types affected:** select-one, select-multiple
   *
   * @example
   * ```
   * [{
   *   value: 'Option 1',
   *   label: 'Option 1',
   *   selected: true,
   *   disabled: false,
   * },
   * {
   *   value: 'Option 2',
   *   label: 'Option 2',
   *   selected: false,
   *   disabled: true,
   *   customProperties: {
   *     description: 'Custom description about Option 2',
   *     random: 'Another random custom property'
   *   },
   * }]
   * ```
   *
   * @default []
   */
  @Input()
  public choices?: Choice[] | Observable<Choice[]>;

  /**
   * The amount of choices to be rendered within the dropdown list `("-1" indicates no limit)`. This is useful if you have a lot of choices where it is easier for a user to use the search area to find a choice.
   *
   * **Input types affected:** select-one, select-multiple
   *
   * @default -1
   */
  @Input()
  public renderChoiceLimit?: number;

  /**
   * The amount of items a user can input/select `("-1" indicates no limit)`.
   *
   * **Input types affected:** text, select-multiple
   *
   * @default -1
   */
  @Input()
  public maxItemCount?: number;

  /**
   * Whether a user can add items.
   *
   * **Input types affected:** text
   *
   * @default true
   */
  @Input()
  public addItems?: boolean;

  /**
   * A filter that will need to pass for a user to successfully add an item.
   *
   * **Input types affected:** text
   *
   * @default null
   */
  @Input()
  public addItemFilter?: string | RegExp | Types.FilterFunction | null;

  /**
   * The text that is shown when a user has inputted a new item but has not pressed the enter key. To access the current input value, pass a function with a `value` argument (see the **default config** [https://github.com/jshjohnson/Choices#setup] for an example), otherwise pass a string.
   *
   * **Input types affected:** text
   *
   * @default
   * ```
   * (value) => `Press Enter to add <b>"${value}"</b>`;
   * ```
   */
  @Input()
  public addItemText?: string | Types.NoticeStringFunction;

  /**
   * Whether a user can remove items.
   *
   * **Input types affected:** text, select-multiple
   *
   * @default true
   */
  @Input()
  public removeItems?: boolean;

  /**
   * Whether each item should have a remove button.
   *
   * **Input types affected:** text, select-one, select-multiple
   *
   * @default false
   */
  @Input()
  public removeItemButton?: boolean;

  /**
   * Whether a user can edit items. An item's value can be edited by pressing the backspace.
   *
   * **Input types affected:** text
   *
   * @default false
   */
  @Input()
  public editItems?: boolean;

  /**
   * Whether HTML should be rendered in all Choices elements.
   * If `false`, all elements (placeholder, items, etc.) will be treated as plain text.
   * If `true`, this can be used to perform XSS scripting attacks if you load choices from a remote source.
   *
   * **Deprecation Warning:** This will default to `false` in a future release.
   *
   * **Input types affected:** text, select-one, select-multiple
   *
   * @default false
   */
  @Input()
  public allowHTML?: boolean;

  /**
   * Whether each inputted/chosen item should be unique.
   *
   * **Input types affected:** text, select-multiple
   *
   * @default true
   */
  @Input()
  public duplicateItemsAllowed?: boolean;

  /**
   * What divides each value. The default delimiter separates each value with a comma: `"Value 1, Value 2, Value 3"`.
   *
   * **Input types affected:** text
   *
   * @default ','
   */
  @Input()
  public delimiter?: string;

  /**
   * Whether a user can paste into the input.
   *
   * **Input types affected:** text, select-multiple
   *
   * @default true
   */
  @Input()
  public paste?: boolean;

  /**
   * Whether a search area should be shown.
   *
   * @note Multiple select boxes will always show search areas.
   *
   * **Input types affected:** select-one
   *
   * @default true
   */
  @Input()
  public searchEnabled?: boolean;

  /**
   * Whether choices should be filtered by input or not. If `false`, the search event will still emit, but choices will not be filtered.
   *
   * **Input types affected:** select-one
   *
   * @default true
   */
  @Input()
  public searchChoices?: boolean;

  /**
   * The minimum length a search value should be before choices are searched.
   *
   * **Input types affected:** select-one, select-multiple
   *
   * @default 1
   */
  @Input()
  public searchFloor?: number;

  /**
   * The maximum amount of search results to show.
   *
   * **Input types affected:** select-one, select-multiple
   *
   * @default 4
   */
  @Input()
  public searchResultLimit?: number;

  /**
   * Specify which fields should be used when a user is searching. If you have added custom properties to your choices, you can add these values thus: `['label', 'value', 'customProperties.example']`.
   *
   * Input types affected:select-one, select-multiple
   *
   * @default ['label', 'value']
   */
  @Input()
  public searchFields?: string[];

  /**
   * Whether the dropdown should appear above `(top)` or below `(bottom)` the input. By default, if there is not enough space within the window the dropdown will appear above the input, otherwise below it.
   *
   * **Input types affected:** select-one, select-multiple
   *
   * @default 'auto'
   */
  @Input()
  public position?: PositionOptionsType;

  /**
   * Whether the scroll position should reset after adding an item.
   *
   * **Input types affected:** select-multiple
   *
   * @default true
   */
  @Input()
  public resetScrollPosition?: boolean;

  /**
   * Whether choices and groups should be sorted. If false, choices/groups will appear in the order they were given.
   *
   * **Input types affected:** select-one, select-multiple
   *
   * @default true
   */
  @Input()
  public shouldSort?: boolean;

  /**
   * Whether items should be sorted. If false, items will appear in the order they were selected.
   *
   * **Input types affected:** text, select-multiple
   *
   * @default false
   */
  @Input()
  public shouldSortItems?: boolean;

  /**
   * The function that will sort choices and items before they are displayed (unless a user is searching). By default choices and items are sorted by alphabetical order.
   *
   * **Input types affected:** select-one, select-multiple
   *
   * @example
   * ```
   * // Sorting via length of label from largest to smallest
   * const example = new Choices(element, {
   *   sorter: function(a, b) {
   *     return b.label.length - a.label.length;
   *   },
   * };
   * ```
   *
   * @default sortByAlpha
   */
  @Input()
  public sorter?: (current: Choice, next: Choice) => number;

  /**
   * Whether the input should show a placeholder. Used in conjunction with `placeholderValue`. If `placeholder` is set to true and no value is passed to `placeholderValue`, the passed input's placeholder attribute will be used as the placeholder value.
   *
   * **Input types affected:** text, select-multiple
   *
   * @note For single select boxes, the recommended way of adding a placeholder is as follows:
   * ```
   * <select>
   *   <option placeholder>This is a placeholder</option>
   *   <option>...</option>
   *   <option>...</option>
   *   <option>...</option>
   * </select>
   * ```
   *
   * @default true
   */
  @Input()
  public placeholder?: boolean;

  /**
   * The value of the inputs placeholder.
   *
   * **Input types affected:** text, select-multiple
   *
   * @default null
   */
  @Input()
  public placeholderValue?: string | null;

  /**
   * The value of the search inputs placeholder.
   *
   * **Input types affected:** select-one
   *
   * @default null
   */
  @Input()
  public searchPlaceholderValue?: string | null;

  /**
   * Prepend a value to each item added/selected.
   *
   * **Input types affected:** text, select-one, select-multiple
   *
   * @default null
   */
  @Input()
  public prependValue?: string | null;

  /**
   * Append a value to each item added/selected.
   *
   * **Input types affected:** text, select-one, select-multiple
   *
   * @default null
   */
  @Input()
  public appendValue?: string | null;

  /**
   * Whether selected choices should be removed from the list. By default choices are removed when they are selected in multiple select box. To always render choices pass `always`.
   *
   * **Input types affected:** select-one, select-multiple
   *
   * @default 'auto';
   */
  @Input()
  public renderSelectedChoices?: 'auto' | 'always';

  /**
   * The text that is shown whilst choices are being populated via AJAX.
   *
   * **Input types affected:** select-one, select-multiple
   *
   * @default 'Loading...'
   */
  @Input()
  public loadingText?: string;

  /**
   * The text that is shown when a user's search has returned no results. Optionally pass a function returning a string.
   *
   * **Input types affected:** select-one, select-multiple
   *
   * @default 'No results found'
   */
  @Input()
  public noResultsText?: string | Types.StringFunction;

  /**
   * The text that is shown when a user has selected all possible choices. Optionally pass a function returning a string.
   *
   * **Input types affected:** select-multiple
   *
   * @default 'No choices to choose from'
   */
  @Input()
  public noChoicesText?: string | Types.StringFunction;

  /**
   * The text that is shown when a user hovers over a selectable choice.
   *
   * **Input types affected:** select-multiple, select-one
   *
   * @default 'Press to select'
   */
  @Input()
  public itemSelectText?: string;

  /**
   * The text that is shown when a user has focus on the input but has already reached the **max item count** [https://github.com/jshjohnson/Choices#maxitemcount]. To access the max item count, pass a function with a `maxItemCount` argument (see the **default config** [https://github.com/jshjohnson/Choices#setup] for an example), otherwise pass a string.
   *
   * **Input types affected:** text
   *
   * @default
   * ```
   * (maxItemCount) => `Only ${maxItemCount} values can be added.`;
   * ```
   */
  @Input()
  public maxItemText?: string | Types.NoticeLimitFunction;

  /**
   * If no duplicates are allowed, and the value already exists in the array.
   *
   * @default 'Only unique values can be added'
   */
  @Input()
  public uniqueItemText?: string | Types.NoticeStringFunction;

  /**
   * The text that is shown when addItemFilter is passed and it returns false
   *
   * **Input types affected:** text
   *
   * @default 'Only values matching specific conditions can be added'
   */
  @Input()
  public customAddItemText?: string | Types.NoticeStringFunction;

  /**
   * Compare choice and value in appropriate way (e.g. deep equality for objects). To compare choice and value, pass a function with a `valueComparer` argument (see the [default config](https://github.com/jshjohnson/Choices#setup) for an example).
   *
   * **Input types affected:** select-one, select-multiple
   *
   * @default
   * ```
   * (choice, item) => choice === item;
   * ```
   */
  @Input()
  public valueComparer?: Types.ValueCompareFunction;

  /**
   * Classes added to HTML generated by  By default classnames follow the BEM notation.
   *
   * **Input types affected:** text, select-one, select-multiple
   */
  @Input()
  public classNames?: ClassNames;

  /**
   * Choices uses the great Fuse library for searching. You can find more options here: https://fusejs.io/api/options.html
   */
  @Input()
  public fuseOptions?: Fuse.IFuseOptions<IChoices>;

  /**
   * ID of the connected label to improve a11y. If set, aria-labeledby will be added.
   */
  @Input()
  public labelId?: string;

  /**
   * Function to run once Choices initialises.
   *
   * **Input types affected:** text, select-one, select-multiple
   *
   * @note For each callback, this refers to the current instance of  This can be useful if you need access to methods `(this.disable())` or the config object `(this.config)`.
   *
   * @default null
   */
  @Input()
  public callbackOnInit?: ((this: IChoices) => void) | null;

  /**
   * Function to run on template creation. Through this callback it is possible to provide custom templates for the various components of Choices (see terminology). For Choices to work with custom templates, it is important you maintain the various data attributes defined here [https://github.com/jshjohnson/Choices/blob/67f29c286aa21d88847adfcd6304dc7d068dc01f/assets/scripts/src/choices.js#L1993-L2067].
   *
   * **Input types affected:** text, select-one, select-multiple
   *
   * @note For each callback, this refers to the current instance of  This can be useful if you need access to methods `(this.disable())` or the config object `(this.config)`.
   *
   * @example
   * ```
   * const example = new Choices(element, {
   *   callbackOnCreateTemplates: function (template) {
   *     var classNames = this.config.classNames;
   *     return {
   *       item: (data) => {
   *         return template(`
   *           <div class="${classNames.item} ${data.highlighted ? classNames.highlightedState : classNames.itemSelectable}" data-item data-id="${data.id}" data-value="${data.value}" ${data.active ? 'aria-selected="true"' : ''} ${data.disabled ? 'aria-disabled="true"' : ''}>
   *             <span>&bigstar;</span> ${data.label}
   *           </div>
   *         `);
   *       },
   *       choice: (data) => {
   *         return template(`
   *           <div class="${classNames.item} ${classNames.itemChoice} ${data.disabled ? classNames.itemDisabled : classNames.itemSelectable}" data-select-text="${this.config.itemSelectText}" data-choice ${data.disabled ? 'data-choice-disabled aria-disabled="true"' : 'data-choice-selectable'} data-id="${data.id}" data-value="${data.value}" ${data.groupId > 0 ? 'role="treeitem"' : 'role="option"'}>
   *             <span>&bigstar;</span> ${data.label}
   *           </div>
   *         `);
   *       },
   *     };
   *   }
   * });
   * ```
   *
   * @default null
   */
  @Input()
  public callbackOnCreateTemplates?: ((template: Types.StrToEl) => void) | null;

  /**
   * An Observable indicating whether data fetching is in progress. Emits true for loading and false when done.
   */
  @Input()
  public isLoading?: Observable<boolean>;

  //#endregion

  //#region Outputs

  /**
   * Triggered each time an item is added (programmatically or by the user).
   */
  @Output()
  public addItem = new EventEmitter<CustomEvent<AddItemData>>();

  /**
   * Triggered each time an item is removed (programmatically or by the user).
   */
  @Output()
  public removeItem = new EventEmitter<CustomEvent<RemoveItemData>>();

  /**
   * Triggered each time an item is highlighted.
   */
  @Output()
  public highlightItem = new EventEmitter<CustomEvent<HighlightItemData>>();

  /**
   * Triggered each time an item is unhighlighted.
   */
  @Output()
  public unhighlightItem = new EventEmitter<CustomEvent<UnhighlightItemData>>();

  /**
   * Triggered each time a choice is selected by a user,
   * regardless if it changes the value of the input.
   */
  @Output()
  public choice = new EventEmitter<CustomEvent<ChoiceData>>();

  /**
   * Triggered when a user types into an input to search choices.
   */
  @Output()
  public search = new EventEmitter<CustomEvent<SearchData>>();

  /**
   * Triggered when the dropdown is shown.
   */
  @Output()
  public dropdownShown = new EventEmitter<CustomEvent<null>>();

  /**
   * Triggered when the dropdown is hidden.
   */
  @Output()
  public dropdownHidden = new EventEmitter<CustomEvent<null>>();

  /**
   * Triggered when a choice from the dropdown is highlighted.
   * The el argument is choices.passedElement object that was affected.
   */
  @Output()
  public highlightChoice = new EventEmitter<CustomEvent<HighlightChoiceData>>();

  /**
   * Triggered when a user types into an input to search choices.
   * This is the raw event and bypasses the default search mechanism.
   */
  @Output()
  public searchInput = new EventEmitter<string>();

  //#endregion

  constructor(
    private configService: NgxChoicesConfig,
    private element: ElementRef,
    private renderer: Renderer2
  ) {
    this.element.nativeElement.addEventListener('change', () =>
      this.notifyFormChange()
    );
  }

  public ngOnInit(): void {
    this.instance = new Choices(this.element.nativeElement, this.getConfig());
    if (this.choices instanceof Observable) {
      this.setupObservableChoices();
    }
  }

  public ngAfterViewInit(): void {
    this.inputElement = this.element.nativeElement
      .closest('.choices')
      .querySelector('.choices__input.choices__input--cloned');

    if (this.inputElement) {
      this.renderer.listen(this.inputElement, 'input', (event) => {
        this.searchInput.next(event.target.value);
      });
    }

    this.setupLoadingObservable();
  }

  /**
   * Recreate the choices.js instance if any input was changed.
   * We have to recreate it, as the library does not allow changing the config once instantiated.
   */
  public ngOnChanges() {
    if (!this.instance) return;
    const values = this.getValuesAsArray();

    this.instance.destroy();
    this.instance = new Choices(this.element.nativeElement, this.getConfig());
    this.setValueForAllTypes(values);
  }

  public ngOnDestroy(): void {
    this.instance.destroy();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  public writeValue(value: string | string[]): void {
    this.removeActiveItems();
    this.setValueForAllTypes(value);
  }

  private setValueForAllTypes(value: string | string[]): void {
    if (this.type == 'text') {
      if (!Array.isArray(value)) {
        value = [value];
      }
      this.setValue(value);
    } else {
      this.setChoiceByValue(value);
    }
  }

  private setupObservableChoices() {
    if (!(this.choices instanceof Observable)) {
      console.error('Can not setup choices observable.');
      return;
    }

    const obs = this.choices as Observable<Choice[]>;

    const sub = obs.subscribe((choices) => {
      this.setChoices(choices, 'value', 'label', true);
    });

    this.subscriptions.push(sub);
  }

  private setupLoadingObservable() {
    const sub = this.isLoading?.subscribe((val) => {
      if (val) {
        this.showLoading();
      } else {
        this.hideLoading();
      }
    });

    if (sub) {
      this.subscriptions.push(sub);
    }
  }

  public registerOnChange(fn?: Callback): void {
    this.onChange = fn;
  }

  // Is part of the ControlValueAccessor interface
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public registerOnTouched(_fn?: Callback): void {}

  public setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  //#region Methods

  /**
   * Creates a new instance of Choices, adds event listeners,
   * creates templates and renders a Choices element to the DOM.
   *
   * @remarks  This is called implicitly when a new instance of Choices is created.
   * This would be used after a Choices instance had already been destroyed (using destroy()).
   */
  public init(): void {
    this.instance.init();
  }

  /**
   * Highlight each chosen item (selected items can be removed).
   */
  public highlightAll(): Choices {
    return this.instance.highlightAll();
  }

  /**
   * Un-highlight each chosen item.
   */
  public unhighlightAll(): Choices {
    return this.instance.unhighlightAll();
  }

  /**
   * Remove each item by a given value.
   */
  public removeActiveItemsByValue(value: string): Choices {
    return this.instance.removeActiveItemsByValue(value);
  }

  /**
   * Remove each selectable item.
   */
  public removeActiveItems(excludeId: number | null = null): Choices {
    // The method does not require an exclude id, however the type annotation is wrong. Therefore, we cast it to any.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.instance.removeActiveItems(excludeId as any);
  }

  /**
   * Remove each item the user has selected.
   */
  public removeHighlightedItems(runEvent?: boolean): Choices {
    return this.instance.removeHighlightedItems(runEvent);
  }

  /**
   * Show option list dropdown (only affects select inputs).
   */
  public showDropdown(): Choices {
    return this.instance.showDropdown();
  }

  /**
   * Hide option list dropdown (only affects select inputs).
   */
  public hideDropdown(preventInputBlur?: boolean): Choices {
    return this.instance.hideDropdown(preventInputBlur);
  }

  /**
   * Set choices of select input via an array of objects
   * (or function that returns array of object or promise of it),
   * a value field name and a label field name.
   *
   * This behaves the similar as passing items via the choices option
   * but can be called after initialising Choices.
   * This can also be used to add groups of choices (see example 3);
   * Optionally pass a true replaceChoices value to remove any existing choices.
   * Optionally pass a customProperties object to add additional
   * data to your choices (useful when searching/filtering etc).
   * Passing an empty array as the first parameter,
   * and a true replaceChoices is the same as calling clearChoices (see below).
   *
   * @example
   * Example 1:
   * ```
   * const example = new Choices(element);
   *
   * example.setChoices(
   *   [
   *     { value: 'One', label: 'Label One', disabled: true },
   *     { value: 'Two', label: 'Label Two', selected: true },
   *     { value: 'Three', label: 'Label Three' },
   *   ],
   *   'value',
   *   'label',
   *    false,
   * );
   * ```
   *
   * @example
   * Example 2:
   * ```
   * const example = new Choices(element);
   *
   * // Passing a function that returns Promise of choices
   * example.setChoices(async () => {
   *   try {
   *     const items = await fetch('/items');
   *     return items.json();
   *   } catch (err) {
   *     console.error(err);
   *   }
   * });
   * ```
   *
   * @example
   * Example3:
   * ```
   * const example = new Choices(element);
   *
   * example.setChoices(
   *   [
   *     {
   *       label: 'Group one',
   *       id: 1,
   *       disabled: false,
   *       choices: [
   *         { value: 'Child One', label: 'Child One', selected: true },
   *         { value: 'Child Two', label: 'Child Two', disabled: true },
   *         { value: 'Child Three', label: 'Child Three' },
   *       ],
   *     },
   *     {
   *       label: 'Group two',
   *       id: 2,
   *       disabled: false,
   *       choices: [
   *         { value: 'Child Four', label: 'Child Four', disabled: true },
   *         { value: 'Child Five', label: 'Child Five' },
   *         {
   *           value: 'Child Six',
   *           label: 'Child Six',
   *           customProperties: {
   *             description: 'Custom description about child six',
   *             random: 'Another random custom property',
   *           },
   *         },
   *       ],
   *     },
   *   ],
   *   'value',
   *   'label',
   *   false,
   * );
   * ```
   */
  public setChoices(
    choicesArrayOrFetcher?:
      | Choice[]
      | Group[]
      | ((instance: Choices) => Choice[] | Promise<Choice[]>),
    value?: string,
    label?: string,
    replaceChoices?: boolean
  ): Choices | Promise<Choices> {
    return this.instance.setChoices(
      choicesArrayOrFetcher,
      value,
      label,
      replaceChoices
    );
  }

  /**
   * Clear all choices from select
   */
  public clearChoices(): Choices {
    return this.instance.clearChoices();
  }

  /**
   * Get value(s) of input (i.e. inputted items (text) or selected choices (select)).
   * Optionally pass an argument of true to only return values rather than value objects.
   *
   * @example
   * ```
   * const example = new Choices(element);
   * const values = example.getValue(true); // returns ['value 1', 'value 2'];
   * const valueArray = example.getValue(); // returns [{ active: true, choiceId: 1, highlighted: false, id: 1, label: 'Label 1', value: 'Value 1'},  { active: true, choiceId: 2, highlighted: false, id: 2, label: 'Label 2', value: 'Value 2'}];
   * ```
   */
  public getValue(valueOnly?: boolean): string | string[] | Item | Item[] {
    return this.instance.getValue(valueOnly);
  }

  /**
   * Set value of input based on an array of objects or strings.
   * This behaves exactly the same as passing items via the items option
   * but can be called after initialising Choices.
   *
   * @example
   * ```
   * const example = new Choices(element);
   *
   * // via an array of objects
   * example.setValue([
   *   { value: 'One', label: 'Label One' },
   *   { value: 'Two', label: 'Label Two' },
   *   { value: 'Three', label: 'Label Three' },
   * ]);
   *
   * // or via an array of strings
   * example.setValue(['Four', 'Five', 'Six']);
   * ```
   */
  public setValue(items: string[] | Item[]): Choices {
    return this.instance.setValue(items);
  }

  /**
   * Set value of input based on existing Choice.
   * @param value can be either a single string or an array of strings
   *
   * @example
   * ```
   * const example = new Choices(element, {
   *   choices: [
   *     { value: 'One', label: 'Label One' },
   *     { value: 'Two', label: 'Label Two', disabled: true },
   *     { value: 'Three', label: 'Label Three' },
   *   ],
   * });
   *
   * example.setChoiceByValue('Two'); // Choice with value of 'Two' has now been selected.
   * ```
   */
  public setChoiceByValue(value: string | string[]): Choices {
    // The documentation allows a list of strings however the interface of the method is wrong.
    // Therefore we cast it to any to supress the warning.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.instance?.setChoiceByValue(value as any);
  }

  /**
   * Removes all items, choices and groups. Use with caution.
   */
  public clearStore(): Choices {
    return this.instance.clearStore();
  }

  /**
   * Clear input of any user inputted text.
   */
  public clearInput(): Choices {
    return this.instance.clearInput();
  }

  /**
   * Disables input from accepting new value/selecting further choices.
   */
  public disable(): Choices {
    return this.instance.disable();
  }

  /**
   * Enables input to accept new values/select further choices.
   */
  public enable(): Choices {
    return this.instance.enable();
  }

  public showLoading(): void {
    const choicesElement = this.element.nativeElement.closest('.choices');

    if (choicesElement) {
      this.renderer.addClass(choicesElement, 'choices__loading--indicator');
    }
  }

  public hideLoading(): void {
    const choicesElement = this.element.nativeElement.closest('.choices');

    if (choicesElement) {
      this.renderer.removeClass(choicesElement, 'choices__loading--indicator');
    }
  }

  public isEmpty(): boolean {
    const value = this.getValuesAsArray();
    return value.length === 0;
  }

  //#endregion

  private notifyFormChange() {
    this.onChange?.(this.instance.getValue(true));
  }

  private getConfig(): Partial<Options> {
    const config = this.configService?.config;

    const parsedChoices = Array.isArray(this.choices)
      ? this.choices
      : config?.choices;

    const c: Partial<Options> = {
      silent: this.silent ?? config.silent,
      items: this.items ?? config.items,
      choices: parsedChoices,
      renderChoiceLimit: this.renderChoiceLimit ?? config.renderChoiceLimit,
      maxItemCount: this.maxItemCount ?? config.maxItemCount,
      addItems: this.addItems ?? config.addItems,
      addItemFilter: this.addItemFilter ?? config.addItemFilter,
      addItemText: this.addItemText ?? config.addItemText,
      removeItems: this.removeItems ?? config.removeItems,
      removeItemButton: this.removeItemButton ?? config.removeItemButton,
      editItems: this.editItems ?? config.editItems,
      allowHTML: this.allowHTML ?? config.allowHTML,
      duplicateItemsAllowed:
        this.duplicateItemsAllowed ?? config.duplicateItemsAllowed,
      delimiter: this.delimiter ?? config.delimiter,
      paste: this.paste ?? config.paste,
      searchEnabled: this.searchEnabled ?? config.searchEnabled,
      searchChoices: this.searchChoices ?? config.searchChoices,
      searchFloor: this.searchFloor ?? config.searchFloor,
      searchResultLimit: this.searchResultLimit ?? config.searchResultLimit,
      searchFields: this.searchFields ?? config.searchFields,
      position: this.position ?? config.position,
      resetScrollPosition:
        this.resetScrollPosition ?? config.resetScrollPosition,
      shouldSort: this.shouldSort ?? config.shouldSort,
      shouldSortItems: this.shouldSortItems ?? config.shouldSortItems,
      sorter: this.sorter ?? config.sorter,
      placeholder: this.placeholder ?? config.placeholder,
      placeholderValue: this.placeholderValue ?? config.placeholderValue,
      searchPlaceholderValue:
        this.searchPlaceholderValue ?? config.searchPlaceholderValue,
      prependValue: this.prependValue ?? config.prependValue,
      appendValue: this.appendValue ?? config.appendValue,
      renderSelectedChoices:
        this.renderSelectedChoices ?? config.renderSelectedChoices,
      loadingText: this.loadingText ?? config.loadingText,
      noResultsText: this.noResultsText ?? config.noResultsText,
      noChoicesText: this.noChoicesText ?? config.noChoicesText,
      itemSelectText: this.itemSelectText ?? config.itemSelectText,
      maxItemText: this.maxItemText ?? config.maxItemText,
      uniqueItemText: this.uniqueItemText ?? config.uniqueItemText,
      customAddItemText: this.customAddItemText ?? config.customAddItemText,
      valueComparer: this.valueComparer ?? config.valueComparer,
      classNames: {
        ...DEFAULT_CLASSNAMES,
        ...config.classNames,
        ...this.classNames,
      },
      fuseOptions: this.fuseOptions ?? config.fuseOptions,
      labelId: this.labelId ?? config.labelId,
      callbackOnInit: this.callbackOnInit ?? config.callbackOnInit,
      callbackOnCreateTemplates:
        this.callbackOnCreateTemplates ?? config.callbackOnCreateTemplates,
    };
    Object.keys(c).forEach(
      (key) =>
        c[key as keyof Options] === undefined && delete c[key as keyof Options]
    );

    return c;
  }

  private getValuesAsArray(): string[] {
    let value = this.instance?.getValue();
    if (value === undefined) {
      return [];
    }
    if (!Array.isArray(value)) {
      value = [value] as string[] | Item[];
    }

    return value.map((x) => (x as Item)?.value ?? x);
  }
}
