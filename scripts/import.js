const fs = require('fs');
const path = require('path');
const converter = require('json-2-csv');
const slugify = require('slugify');
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
  {
    name: 'path', alias: 'p', type: String,
  },
  {
    name: 'name', alias: 'n', type: String, defaultValue: 'primary',
  },
];

const options = commandLineArgs(optionDefinitions);

const csvPath = path.resolve(process.cwd(), options.path);

if (!fs.existsSync(csvPath)) {
  console.error('tech-radar.csv does not exist.  Import aborted.');
}
const csv = fs.readFileSync(csvPath, 'utf8');

// This reads in the specified csv file and turns it into a JSON array with sub-objects for each
// entry.
converter.csv2json(csv, (error, blips) => {
  blips.forEach((blip) => {
    try {
      // This is building a path where we want to put this blip.  It's intentionally verbose in
      // case we later want to add some descriptions of the radars, quadrants, and rings to justify
      // our choices.

      // We use slugify to ensure consistent, simple naming.  It strips out spaces, capitals, etc.
      // I don't think we have a use case for non a-z0-9 characters, but it can be tweaked to allow
      // them if we want/need to.  Note that this doesn't change the displayed "name" of the quadrants, rings, or blips, just the directory/filenames.
      const blipPath = path.resolve(
        process.cwd(),
        'radars',
        options.name,
        'quadrants',
        `${slugify(blip.quadrant, { lower: true })}`,
        'rings',
        `${slugify(blip.ring, { lower: true })}`,
        'blips',
      );
      // Make sure that the directory exists before trying to write the file.
      fs.mkdirSync(blipPath, { recursive: true });
      fs.writeFileSync(
        path.resolve(
          blipPath,
          `${slugify(blip.name, { lower: true })}.json`,
        ),
        // We pretty-print the JSON so that it's human friendly, as we expect folks to edit these JSON files manually.
        JSON.stringify(blip, null, 2),
      );
    } catch (blipError) {
      console.error(blipError);
    }
  });
});
