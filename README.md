# Polyethylene Workbench

My Amiga Workbench 1.x style homepage. Also my first Angular project.

This does not aim at remaking an Amiga style desktop same as the original one, more likely to be a collection of ideas.

This is still highly experimental and there might be bugs.

[Try it out](https://polyethylene.app/)

## Features

- Pure CSS Amiga Workbench 1.x theme, customizable colors.
- Drag & drop icons between windows

## Setup

- Install [Node.js](https://nodejs.org/) if you don't have it.
- Install Angular CLI if you don't have it: `npm install -g @angular/cli`
- Clone this repository and install dependencies. (I don't think you can deal with my project well if you even don't know how to do this)

## Run in development

- Run `ng serve` for a dev server
- Navigate to `http://localhost:4200/`.

## Build

- Run `ng build` to build the project. Use the `--prod` flag for a production build.
- The build artifacts will be stored in the `dist/` directory.

## Add application
- Create a component and put it in `src/app/apps/`
- Add `close = () => { };` to the class. It will be replaced by the application manager service. Call it to exit the application.
- Add declaration to `src/app/apps/index.ts`
- Add icon for opening the application in `src/app/apps/icons.ts`

## Add icon

- Only use 5 colors in your icon: transparent, #000000, #ffffff, #ffff00, #0000ff.
- Put your icons in `assets-src/icons/`
- Run `npm run icons`

## Contributing

Contributing is open. Open an issue, or comment on an existing one before starting a PR, if you want the best chance of it being accepted. (I just don't want to see wasted effort)

## Note

This repository does not include the backend of the message board. Consider make one by yourself if you want to enable it.
