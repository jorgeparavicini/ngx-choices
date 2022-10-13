[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<br />
<div align="center">

<h3 align="center">Angular Choices</h3>

  <p align="center">
    A lightweight wrapper for the awesome [choices.js](https://github.com/Choices-js/Choices) library
    <br />
    <a href="https://github.com/Choices-js/Choices#configuration-options"><strong>Explore the configuration options »</strong></a>
    <br />
    <br />
    <a href="https://github.com/jorgeparavicini/ngx-choices/tree/master/projects/ngx-app">View Example App</a>
    -
    <a href="https://choices-js.github.io/Choices/">View Demo</a>
    ·
    <a href="https://github.com/jorgeparavicini/ngx-choices/issues">Report Bug</a>
    ·
    <a href="https://github.com/jorgeparavicini/ngx-choices/issues">Request Feature</a>
  </p>
</div>

## Installation

With [NPM](https://www.npmjs.com/package/ngx-choices):

```zsh
npm install ngx-choices.js
```

With [Yarn](https://yarnpkg.com/):

```zsh
yarn add ngx-choices.js
```

### Stylesheet

To style your choices you can either use the original stylesheet from `choices.js`
or the one from this repository. Both are equivalent, but this one has a shorter path :^)

With `angular.json`:

```json
"architect": {
  "build": {
    ...,
    "styles": [
      "node-modules/ngx-choices/styles/ngx-choices.scss"
    ],
    ...,
  }
}
```

With `scss`:

```scss
@import "~ngx-choices/styles/ngx-choices";
```

<!-- USAGE EXAMPLES -->

## Usage

Include the `NgxChoicesModule` in your `AppModule`. This will use the default configuration as described
in the [choices.js documentation](https://github.com/Choices-js/Choices#configuration-options).

```ts
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxChoicesModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

To configure the library globally use the `forRoot` pattern.
This will override the defaults as described in the [choices.js documentation](https://github.com/Choices-js/Choices#configuration-options).

```ts
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgxChoicesModule.forRoot({
      allowHTML: true,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

> If you want to silence the warning from `choices.js` about allowHTML, set it globally as shown above to either true or false.

### Instantiate Component

To create a `text` input:

```html
<ngx-choice type="text"></ngx-choice>
```

To create a `single-choice` input:

```html
<ngx-choice type="select-one"></ngx-choice>
```

To create a `multiple-choice` input:

```html
<ngx-choice type="select-multiple"></ngx-choice>
```

### Customization & Updates

To customize a single `ngx-choice` bind the wanted input to the component.
Doing so overrides the default configuration of `choices.js` and the ones given by the `forRoot` pattern.

```html
<ngx-choice [choices]="choices" type="select-multiple"></ngx-choice>
```

For the example above create a property `choices` on the component containing all possible choices.

```ts
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
```

To receive events from the component subscribe to them in the usual angular way:

```html
<ngx-choice
  [choices]="choices"
  (showDropdown)="showDropdown"
  type="select-multiple"
></ngx-choice>
```

To find a list of all possible inputs and outputs see the official documentation from [`choices.js`](https://github.com/Choices-js/Choices#configuration-options).

> **_NOTE:_** All options are named the same as in the original `choices.js` except the `change` event.
> This event was renamed to `changeValue` as the original name is a reserved event.

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/jorgeparavicini/ngx-choices.svg
[contributors-url]: https://github.com/jorgeparavicini/ngx-choices/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jorgeparavicini/ngx-choices.svg
[forks-url]: https://github.com/jorgeparavicini/ngx-choices/network/members
[stars-shield]: https://img.shields.io/github/stars/jorgeparavicini/ngx-choices.svg
[stars-url]: https://github.com/jorgeparavicini/ngx-choices/stargazers
[issues-shield]: https://img.shields.io/github/license/jorgeparavicini/ngx-choices
[issues-url]: https://github.com/jorgeparavicini/ngx-choices/issues
[license-shield]: https://img.shields.io/github/license/jorgeparavicini/ngx-choices
[license-url]: https://github.com/jorgeparavicini/ngx-choices/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/jorge-paravicini-135773133/
