import plot from './plot.vue';

// 存储组件列表
const components = [plot];

// 定义 install 方法，接收 Vue 作为参数。如果使用 use 注册插件，则所有的组件都将被注册
const install = function (app: any) {
  // 遍历注册全局组件
  components.map((component) => app.component(component.name, component));
};

export default {
  install,
  plot,
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (typeof window !== 'undefined' && window.Vue) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.Vue.use(plot);
}
