# Clamshell

[Blip](https://github.com/tidepool-org/blip)'s companion mobile web app, used for messaging.

Tech stack:

- [React](http://facebook.github.io/react)

Table of contents:

- [Install](#install)
- [Quick start](#quick-start)
- [Development](#development)
    - [Code organization](#code-organization)
    - [React components](#react-components)
    - [Styling](#styling)
    - [Vendor packages](#vendor-packages)
    - [JSHint](#jshint)
- [Testing](#testing)

## Install

Requirements:

- [Node.js](http://nodejs.org/)

Clone this repo then install dependencies:

```bash
$ npm install .
```

## Quick start

After having completed the install, first make a copy of the sample config file:

```bash
$ cp config/sample.sh config/demo.sh
```

In the new config file, edit the environment variable to run in "demo" mode: `DEMO="true"`.

(If instead you're running against a local instance of the Tidepool platform, just make a copy of `sample.sh` named, for example, `local.sh` and use that one in the following instructions.)

In a first terminal, run the following to build the app, as well as watch files for changes and trigger a rebuild when necessary:

```bash
$ source config/demo.sh
$ grunt develop
# Or: $ npm start
```

In a second terminal, start the app server:

```bash
$ source config/demo.sh
$ grunt server
# Or: $ npm run server
```

Navigate your browser to `http://localhost:3001/`.

## Development

The following snippets of documentation should help you find your way around and contribute to the app's code.

### Code organization

- **App** (`src/app.js`): Expose a global `app` object where everything else is attached; create the main React component `app.component`
- **App** (`src/main.js`): Starts the app and used for the webpack build to pull in the various components.
- **Components** (`src/components/`): Reusable React components, the building-blocks of the application.
- **Layout** (`src/layout/`): React container that holds the components that make up the different parts of the screen.
- **Core** (`app/core/`): Core data and service opjects

### React components

When writing [React](http://facebook.github.io/react) components, try to follow the following guidelines:

- Keep components small. If a component gets too big, it might be worth splitting it out into smaller pieces.
- Keep state to a minimum. A component without anything in `state` and only `props` would be best. When state is needed, make sure nothing is reduntant and can be derived from other state values. Move state upstream (to parent components) as much as it makes sense.
- Use the `propTypes` attribute to document what props the component expects

See ["Writing good React components"](http://blog.whn.se/post/69621609605/writing-good-react-components).

### Styling

We use [Less](http://lesscss.org/) as the CSS pre-processor.

Prefix all CSS classes with the component name. For example, if I'm working on the `NoteThread` component, I'll prefix CSS classes with `notethread-`.

Keep styles in the same folder as the component, and import them in the component's `.js` file with `require('./NoteThread.less')` (the `webpack` builder will take care of processing them).

Styles shared throughout the app can be found in `src/core/less/`, and should be used by extending a component's CSS class with them. For example:

```less
.login-form-button {
  &:extend(.btn all);
  &:extend(.btn-primary all);
  // Custom `login-form-button` styles here...
}
```

### Vendor packages

Third-party dependencies are managed via `npm`.

## JSHint

In a separate terminal, you can watch and lint JS files with:

```bash
$ grunt jshint-watch
# Or: $ npm run jshint-watch
```

## Testing

We use the following testing tools:

- [Mocha](http://visionmedia.github.io/mocha/)
- [Chai](http://chaijs.com/)
- [Testem](https://github.com/airportyh/testem)

### Running the tests

To run the tests only once, use:

```bash
$ npm test
```

To run the tests in "watch mode" (re-run on every file change), in a first terminal run:

```bash
$ npm run test-watch
```

And in a second terminal launch:

```bash
$ npm run test-server
# Or if you have testem installed globally you can simply use:
$ testem
```

These will open and run the tests in Chrome by default. You can also open other browsers and point them to the specified URL.
