const fs = require('fs-extra');

const filterFunc = (src, dest) => {
  return src.indexOf('dist/v') <= -1;
};

fs.copySync('./dist', './.lib', { filter: filterFunc });
fs.copySync('./.lib', './dist/v3');

fs.removeSync('./.lib');
