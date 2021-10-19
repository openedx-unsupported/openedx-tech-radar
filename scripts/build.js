const fs = require('fs');
const path = require('path');

const distPath = path.resolve(process.cwd(), 'dist');

fs.mkdirSync(distPath, { recursive: true });
fs.copyFileSync(path.resolve(process.cwd(), 'README.md'), path.resolve(distPath, 'README.md'));
