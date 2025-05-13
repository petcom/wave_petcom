# Scripts

This directory contains utility scripts for managing the Wave Petcom theme project.

## Available Scripts

- **launch.sh**: Opens the local Ghost site in the default web browser. It reads the `GHOST_LOCAL_PATH` from the `.env` file in the project root. If the `.env` file is missing or `GHOST_LOCAL_PATH` is not set, it will display an error message.
- **start.sh**: Starts the local Ghost server using the path in `GHOST_LOCAL_PATH`.
- **stop.sh**: Stops the local Ghost server.
- **restart.sh**: Restarts the local Ghost server.
- **publish.sh**: Zips the entire project into `../wave_petcom.zip`.

## Usage

Each script can be run from the project root or from the `scripts` directory. The scripts automatically detect the current directory and adjust accordingly.

### Example

To launch the local Ghost site, run:

```bash
./scripts/launch.sh
```

or

```bash
cd scripts
./launch.sh
``` 