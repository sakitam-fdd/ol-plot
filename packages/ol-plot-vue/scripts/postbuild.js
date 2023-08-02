const fs = require('fs-extra');

fs.copySync('./dist', './.lib');
fs.copySync('./.lib', './dist/v3');

fs.removeSync('./.lib');
