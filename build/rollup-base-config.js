// Config file for running Rollup in "normal" mode (non-watch)
const babel = require('rollup-plugin-babel');
const json = require('rollup-plugin-json');
const scss = require('rollup-plugin-scss');
const cjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const { eslint } = require('rollup-plugin-eslint');
const friendlyFormatter = require('eslint-friendly-formatter');
const { resolve, _package } = require('./helper');

module.exports = {
  input: resolve('src/index.js'),
  plugins: [
    ...(process.env.NODE_ENV ? [replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })] : []),
    scss({
      output: resolve(_package.style),
      failOnError: false
    }),
    json({
      include: resolve('package.json'),
      indent: ' '
    }),
    eslint({
      configFile: resolve('.eslintrc.js'),
      formatter: friendlyFormatter,
      exclude: [resolve('node_modules')]
    }),
    babel({
      // externalHelpers: true,
      // runtimeHelpers: true,
      exclude: [
        resolve('package.json'),
        resolve('node_modules/**')
      ]
    }),
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    cjs(),
  ],
  external: id => /^ol/.test(id)
};
