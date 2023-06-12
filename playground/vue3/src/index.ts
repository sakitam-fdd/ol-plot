import 'ol-plot-vue/dist/style.css';
import { createApp } from 'vue';
import Plot from 'ol-plot-vue';
import App from './App.vue';

const app = createApp(App);

app.use(Plot);

app.mount('#app');
