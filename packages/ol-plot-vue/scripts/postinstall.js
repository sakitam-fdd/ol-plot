/* eslint-disable @typescript-eslint/no-var-requires */
// const fs = require('fs');
// const path = require('path');
const spawn = require('cross-spawn');
// const pkg = require('../package.json');

function loadModule(name) {
  try {
    return require(name);
  } catch (e) {
    return undefined;
  }
}

const Vue = loadModule('vue');

async function run() {
  console.log(`[ol-plot-vue] Vue version ${Vue.version}`);
  if (!Vue || typeof Vue.version !== 'string') {
    console.warn('[ol-plot-vue] Vue is not found. Please run "pnpm install vue" to install.');
  } else if (Vue.version.startsWith('2.')) {
    console.log('[ol-plot-vue] Switch main field for Vue 2');
    await spawn.sync('pnpm', ['build:vue2'], { stdio: 'inherit' });
  } else {
    console.log('[ol-plot-vue] Switch main field for Vue 3');
    await spawn.sync('pnpm', ['build:vue3'], { stdio: 'inherit' });
  }

  // fs.writeFileSync(path.resolve(__dirname, '../package.json'), JSON.stringify(pkg, null, 2), {
  //   encoding: 'utf-8',
  // });
}

run().then(() => {
  process.exit(0);
});
