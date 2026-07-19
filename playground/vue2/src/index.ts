import 'ol-plot-vue/dist/style.css';
import Vue from 'vue';

import Plot from 'ol-plot-vue';
import App from './App.vue';

Vue.config.productionTip = false;
Vue.use(Plot);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: (createElement) => createElement(App),
});
