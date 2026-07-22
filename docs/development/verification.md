# 开发验证清单

验证范围按风险递增。命令默认从仓库根目录运行。

## 快速迭代

```bash
pnpm --filter ol-plot type-check
pnpm --filter ol-plot test-only
pnpm docs:build
```

Demo 修改还需运行对应构建：

```bash
pnpm --dir playground/single build
pnpm --dir playground/vue2 build
pnpm --dir playground/vue3 build
```

## SDK 完整检查

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm docs:build
```

涉及 OpenLayers API、Interaction 或事件时，按 `.github/workflows/ci.yml` 的矩阵分别安装 `6.15.1`、`7.5.2`、`8.2.0`、`9.2.4`、`10.9.0`，对每个版本运行 SDK 类型检查与 `test:compat`。本地切换依赖不得提交 lockfile 的临时版本变化。

## 浏览器验收

- 点、折线、多边形各绘制一次。
- 折线或多边形双击结束时地图层级保持不变。
- 绘制取消后恢复宿主地图双击缩放状态。
- 选中图形后可以激活和取消编辑，控制点与鼠标状态正确清理。
- 修改点大小、线宽、填充与边框后，画面和数值同步。
- 保存、清空、恢复后几何及样式一致。
- 375px、768px 与桌面宽度下无横向溢出，地图与主要操作可用。

## 提交前检查

- `git diff --check` 无空白错误。
- 没有提交 `dist`、`.vitepress/cache`、`.vitepress/dist` 或 coverage。
- 代码、公开类型、用户文档与 Demo 描述一致。
- 未修改与任务无关的用户工作区内容。
