import 'ol-plot-vue/dist/style.css';
import Vue from 'vue';
import VueCompositionAPI from '@vue/composition-api';

import Plot from 'ol-plot-vue';
import App from './App.vue';

Vue.config.productionTip = false;
Vue.use(VueCompositionAPI);
Vue.use(Plot);

console.log(Vue.version)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
});
