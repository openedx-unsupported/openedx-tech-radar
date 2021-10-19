/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const fs = require('fs');
const path = require('path');
const converter = require('json-2-csv');
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
  {
    name: 'name', alias: 'n', type: String,
  },
];

const options = commandLineArgs(optionDefinitions);

// These 'sort values' are used in a sort function to order our rings and quadrants correctly.
// Lower values should be shown first.
const ringSortValues = {
  adopted: 0,
  accepted: 1,
  provisional: 2,
  hold: 3,
};

const quadrantSortValues = {
  techniques: 0,
  frontend: 1,
  technologies: 2,
  'open-edx': 3,
};

const radarsPath = path.resolve(process.cwd(), 'radars');

// This block iterates over the radar directories and descends through their quadrants, rings, and
// blips to build up an array of JSON objects describing the radar.  It's written simply and
// straightforwardly without trying to be flashy; it could probably be shortened at the expense
// of clarity.

try {
  let radars = [];
  if (options.name) {
    // If the user supplied a radar name, only export that one.
    const radarPath = path.resolve(radarsPath, options.name);
    if (!fs.existsSync(radarPath)) {
      console.error(`Radar directory ${options.path} does not exist.  Export aborted.`);
    }
    radars.push(radarPath);
  } else {
    // Otherwise just read them all.
    radars = fs.readdirSync(radarsPath);
  }

  radars.forEach(radar => {
    const radarPath = path.resolve(radarsPath, radar);
    const radarJson = [];

    const quadrantsPath = path.resolve(radarPath, 'quadrants');
    const quadrants = fs.readdirSync(quadrantsPath);
    // This sorts the quadrants in place according to the ordering above.  Without this our
    // quadrant ordering may be non-deterministic.
    quadrants.sort((a, b) => quadrantSortValues[a] - quadrantSortValues[b]);
    quadrants.forEach(quadrant => {
      const ringsPath = path.resolve(quadrantsPath, quadrant, 'rings');
      const rings = fs.readdirSync(ringsPath);
      // This sorts the rings in place according to the ordering above.  Without this our
      // ring ordering may be non-deterministic.
      rings.sort((a, b) => ringSortValues[a] - ringSortValues[b]);
      rings.forEach(ring => {
        const blipsPath = path.resolve(ringsPath, ring, 'blips');
        const blips = fs.readdirSync(blipsPath);
        // This will just sort the blips alphabetically.  Whether this is the right ordering is up
        // for debate.
        blips.sort();
        blips.forEach(blip => {
          const blipPath = path.resolve(blipsPath, blip);
          const blipData = require(blipPath);
          radarJson.push(blipData);
        });
      });
    });

    // Thank you, json-2-csv, for making the CSV generation dead simple.
    converter.json2csv(radarJson, (error, data) => {
      const distPath = path.resolve(process.cwd(), 'dist');
      // This ensures all our directories exist before we try to write the file.
      fs.mkdirSync(distPath, { recursive: true });
      fs.writeFileSync(path.resolve(process.cwd(), 'dist', `open-edx-${radar}-radar.csv`), data);
    });
  });
} catch (err) {
  console.error(err);
}
