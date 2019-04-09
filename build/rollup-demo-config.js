const serve = require('rollup-plugin-serve');
const { banner, resolve } = require('./helper');
const baseConfig = require('./rollup-base-config');

baseConfig.plugins.push(// Default options
  serve({
    open: true,
    contentBase: [
      'examples', 'dist', 'node_modules/ol'
    ],
    host: 'localhost',
    port: 3003,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  })
);

const config = Object.assign(baseConfig, {
  input: resolve('examples/index.js'),
  output: {
    file: './examples/demo.js',
    format: 'iife',
    // name: _package.namespace,
    banner: banner,
  },
  external: undefined
});

module.exports = config;
