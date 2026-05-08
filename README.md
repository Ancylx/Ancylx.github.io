# Nebula Logs · 星云日志

**学习笔记 · 技术导航 · 资源聚合**

面向编程学习者的个人技术主页，集多引擎搜索、分类导航、资源聚合、个人展示于一体。采用原生前端技术栈构建，部署于 GitHub Pages。

## 在线访问

[https://ancylx.github.io](https://ancylx.github.io)

## 页面结构

```
首页 (index.html)
├── 程序开发   → pages/programming/programmingmainpage.html
├── 人工智能   → pages/aigc/aigcmainpage.html
├── 视觉设计   → pages/design/designmainpage.html
├── 工具资源   → pages/tools/tools.html
├── 学习笔记   → pages/notes/notes.html
├── 关于我     → pages/web/self.html
├── 留言板     → contact.html
├── 图片展示   → gallery.html
└── 实验特效   → lab.html
```

## 技术栈

- **HTML5** — 语义化标签，内联 SVG 图标
- **CSS3** — CSS 变量设计令牌系统，Grid / Flexbox 布局，`prefers-color-scheme` 亮暗双主题自动切换，玻璃拟态效果（`backdrop-filter`），768px / 480px 双断点响应式
- **JavaScript** — 原生 ES5+，零框架依赖

## 功能特性

- **多引擎搜索** — 支持 Google / Bing / Bilibili / 知乎 / GitHub 等搜索引擎循环切换，回车触发
- **悬停预览** — 单例模式 + 延迟预加载，头像悬停 150ms 显示高清大图（`preview-system.js`）
- **分类折叠** — 子页面内容卡片支持展开/收起动画，IntersectionObserver 滚动淡入
- **资源导航** — 玻璃拟态卡片网格，图标加载失败自动回退默认图
- **表单验证** — 留言板实时正则校验邮箱格式，非空完整性检查
- **图片画廊** — CSS Grid `dense` 自动填充，长短图错落排版，控制面板动态调整参数
- **星空背景** — 多层径向渐变 + CSS 动画，固定定位 GPU 加速

## 文件说明

| 文件 | 说明 |
|------|------|
| `index.html` | 首页（Logo + Banner + 搜索 + 栏目导航 + 资源网格） |
| `shared.css` | 全局样式表 v1.3.0（18 个模块，CSS 变量系统） |
| `preview-system.js` | 通用悬停预览系统 v1.0.1 |
| `contact.html` | 留言板（表单 + 正则验证） |
| `gallery.html` | 图片展示（灵活网格 + 控制面板） |
| `lab.html` | 实验特效页 |
| `fonts/` | 商免字体 |
| `images/` | 背景、头像、默认回退图 |

## 设计风格

以"星云"为视觉核心，暗色模式为主 —— 深空蓝渐变背景 + 星云绿（`#b6da3e`）主题色 + 玻璃拟态半透明卡片。亮色模式通过 `prefers-color-scheme` 自动切换，保证不同光照环境下的可读性。

## 部署

项目托管于 GitHub Pages，`main` 分支即部署分支。本地开发可使用 VS Code Live Server 插件预览。

## 致谢

- [PhotoShow](https://github.com/Mr-VincentW/PhotoShow/tree/archive) — 悬停预览系统参考
