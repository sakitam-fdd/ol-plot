import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import PlotPlayground from './components/PlotPlayground.vue';
import HeroSymbol from './components/HeroSymbol.vue';
import './style.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PlotPlayground', PlotPlayground);
    app.component('HeroSymbol', HeroSymbol);
  },
} satisfies Theme;
