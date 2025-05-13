# Wave Petcom

This is a Petcom-maintained clone of the [Wave](https://github.com/TryGhost/Wave) theme, which is a [Ghost](https://github.com/TryGhost/Ghost) theme dedicated to podcasters. Share your voice and words with your audience.

**Original Demo: https://wave.ghost.io**

**Original Repository: [TryGhost/Wave](https://github.com/TryGhost/Wave)**

**Petcom Repository: [Petcom/Wave_Petcom](https://github.com/petcom/wave_petcom)**

**Changes from Original**: See [CHANGES-FROM-ORIGINAL.md](docs/CHANGES-FROM-ORIGINAL.md) for details on modifications made in this repository.

# Instructions

1. [Download this theme](https://github.com/petcom/wave_petcom/archive/main.zip)
2. Log into Ghost, and go to the `Design` settings area to upload the zip file

# Local Development

## Using app.sh

The theme includes a CLI tool (`app.sh`) to help with local development. Before using it, create a `.env` file in the project root with your Ghost installation path:

```bash
GHOST_LOCAL_PATH=/path/to/your/ghost/installation
```

Available commands:

```bash
./app.sh [command]

Commands:
  start    - Start the local Ghost server
  stop     - Stop the local Ghost server
  restart  - Restart the local Ghost server
  refresh  - Update theme and restart Ghost in development mode
  view     - Open the local Ghost site in the browser
  publish  - Zip the project into ../wave_petcom.zip
  help     - Show this help message
```

The `refresh` command is particularly useful during development as it:
- Updates the theme in Ghost
- Restarts Ghost in development mode
- Enables live reloading
- Shows detailed error messages

## Traditional Development

Edition styles are compiled using Gulp/PostCSS to polyfill future CSS spec. You'll need [Node](https://nodejs.org/), [Yarn](https://yarnpkg.com/) and [Gulp](https://gulpjs.com) installed globally. After that, from the theme's root directory:

```bash
# Install
yarn

# Run build & watch for changes
yarn dev
```

Now you can edit `/assets/css/` files, which will be compiled to `/assets/built/` automatically.

The `zip` Gulp task packages the theme files into `dist/wave.zip`, which you can then upload to your site.

```bash
yarn zip
```

# Contribution

This repo is synced automatically with [TryGhost/Themes](https://github.com/TryGhost/Themes) monorepo. If you're looking to contribute or raise an issue, head over to the main repository [TryGhost/Themes](https://github.com/TryGhost/Themes) where our official themes are developed.

## Copyright & License

Copyright (c) 2013-2025 Ghost Foundation - Released under the [MIT license](LICENSE).
