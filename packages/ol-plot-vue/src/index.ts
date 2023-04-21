import type { Plugin } from 'vue';
import plot from './plot.vue';

// 存储组件列表
const components = [plot];

// 定义 install 方法，接收 Vue 作为参数。如果使用 use 注册插件，则所有的组件都将被注册
const install: Plugin['install'] = function (app) {
  // 遍历注册全局组件
  components.map((component) => app.component(component.name, component));
};

export default {
  install,
  plot,
};

// @ts-expect-error
if (typeof window !== 'undefined' && window.Vue) {
  // @ts-expect-error
  window.Vue.use(plot);
}
