---
layout: home

hero:
  name: OL Plot
  text: 把复杂标绘，变成清晰的地图交互
  tagline: 面向 OpenLayers 6–10 的 TypeScript 标绘 SDK。27 种符号、可视化编辑、序列化恢复，一套 API 覆盖原生 JavaScript 与 Vue。
  actions:
    - theme: brand
      text: 5 分钟上手
      link: /guide/getting-started
    - theme: alt
      text: 打开 Playground
      link: /examples/playground
  image:
    component: HeroSymbol

features:
  - icon: ◎
    title: 27 种标绘符号
    details: 从基础点线面到进攻箭头、双箭头、集结地与旗标，覆盖常用 GIS 标绘语义。
  - icon: ↗
    title: 稳定的交互内核
    details: 像素级控制点容差、可恢复的地图交互状态和完整事件清理，在不同投影与缩放级别下保持一致。
  - icon: ◫
    title: OpenLayers 6–10
    details: 明确的 peer 范围与自动化版本矩阵，持续验证多个主版本的构建和核心算法。
  - icon: { }
    title: TypeScript 友好
    details: 公开 PlotOptions、序列化模型与核心类命名导出，IDE 可以直接补全关键配置。
---

<div class="home-section">
  <span class="section-eyebrow">Try it now</span>
  <h2>文档就是可以运行的产品</h2>
  <p>选择一个标绘符号，在地图上点击控制点。完成后直接拖动图形或编辑控制点，无需离开当前页面。</p>
  <ClientOnly>
    <PlotPlayground />
  </ClientOnly>
</div>
