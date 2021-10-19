# Scripts

There are two scripts here, one to generate JSON files from a CSV, and one to generate a CSV from the JSON files.

## import.js

The "import" script is intended to be used to seed a new radar.  It shouldn't be needed as part of the build.  The intention is that a CSV, generated from a Google Spreadsheet most likely, will be dropped in the directory and used one time to generate a new set of radar JSONs.

```
npm run import -- -p my-tech-radar.csv -n my-radar
```

This will generate a structure in the `radars/my-radar` directory with sub-directories for quadrants, rings, and blips.  This directory structure is intended to be checked in.  The build script will generate a CSV from it automatically at build-time.

## export.js

The "export" script is run as part of the build.  It generates a CSV usable by Thoughtworks Tech Radar generator, here: https://radar.thoughtworks.com/.

It combines all the JSON files in the `radars` sub-directories into a CSV file, one for each radar.

```
npm run export
```

Or more canonically from a deployment perspective:

```
npm run build
```

You can optionally provide a radar name to build a single radar:

```
npm run export -- -n primary
```
