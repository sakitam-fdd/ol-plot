/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const spawn = require('cross-spawn');
const pkg = require('../package.json');

function loadModule(name) {
  try {
    return require(name);
  } catch (e) {
    return undefined;
  }
}

const Vue = loadModule('vue');

const dir = path.resolve(__dirname, '..', 'dist');

function copy(name, targetName, version) {
  const src = path.join(dir, `v${version}`, name);
  const dest = path.join(dir, targetName);
  const content = fs.readFileSync(src, 'utf-8');
  try {
    fs.unlinkSync(dest);
  } catch (error) {}
  fs.writeFileSync(dest, content, 'utf-8');
}

async function switchVersion(version) {
  copy('ol-plot-vue.cjs.js', 'ol-plot-vue.cjs.js', version);
  copy('ol-plot-vue.es.js', 'ol-plot-vue.es.js', version);
  copy('ol-plot-vue.js', 'ol-plot-vue.js', version);
  if (version === 2) {
    copy('ol-plot-vue.es.d.ts', 'index.d.ts', version);
  } else {
    copy('index.d.ts', 'index.d.ts', version);
  }

  copy('style.css', 'style.css', version);
}

async function run() {
  console.log(`[ol-plot-vue] Vue version ${Vue.version}`);
  if (!Vue || typeof Vue.version !== 'string') {
    console.warn('[ol-plot-vue] Vue is not found. Please run "pnpm install vue" to install.');
  } else if (Vue.version.startsWith('2.')) {
    console.log('[ol-plot-vue] Switch main field for Vue 2');
    await switchVersion(2);
  } else {
    console.log('[ol-plot-vue] Switch main field for Vue 3');
    await switchVersion(3);
  }

  fs.writeFileSync(path.resolve(__dirname, '../package.json'), JSON.stringify(pkg, null, 2), {
    encoding: 'utf-8',
  });
}

run().then(() => {
  process.exit(0);
});
