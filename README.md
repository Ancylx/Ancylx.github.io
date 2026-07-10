# Nebula Logs · 星云日志

**学习笔记 · 技术导航 · 资源聚合**

面向编程学习者的个人技术主页，集多引擎搜索、分类导航、资源聚合、轮播展示、登录认证于一体。采用原生前端技术栈构建，部署于 GitHub Pages。

## 在线访问

[https://ancylx.github.io](https://ancylx.github.io)

## 页面结构

```
首页 (index.html)
├── 登录页     → pages/account/login.html
├── 注册页     → pages/account/register.html
├── 找回密码   → pages/account/forgot.html
├── 程序开发   → pages/programming/programmingmainpage.html
├── 人工智能   → pages/aigc/aigcmainpage.html
├── 视觉设计   → pages/design/designmainpage.html
├── 工具资源   → pages/tools/tools.html
├── 学习笔记   → pages/notes/notes.html
├── 关于我     → pages/self/self.html
├── 留言板     → pages/contact/contact.html
├── 图片展示   → pages/gallery/gallery.html
└── 实验特效   → pages/lab/lab.html
```

## 技术栈

- **HTML5** — 语义化标签，内联 SVG 图标
- **CSS3** — CSS 变量设计令牌系统，Grid / Flexbox 布局，`prefers-color-scheme` 亮暗双主题自动切换，玻璃拟态效果（`backdrop-filter`），淡入淡出轮播动画，768px / 480px / 1024px 三断点响应式
- **JavaScript** — 原生 ES5+，零框架依赖；轮播控制器（自动播放 / 悬停暂停 / 指示点跳转）、登录表单正则实时校验与 Tab 切换、悬停预览系统
- **Python 3** — 批处理脚本（画廊图片整理、HTML 增量更新）

## 功能特性

- **多引擎搜索** — 支持 Bing / Google / GitHub / Baidu 四个搜索引擎循环切换，回车触发，图标使用 `images/icon/web-icon-*.png`
- **Logo** — 使用PS制作 `images/icon/` 下特色图标
- **9 栏目导航** — 首页两行共 9 张栏目导航卡片（程序开发 / 人工智能 / 视觉设计 / 工具资源 / 学习笔记 / 关于我 + 留言板 / 图片展示 / 实验特效），悬停上浮 + 边框光效
- **Banner 轮播图** — 5 张 Banner 图片淡入淡出自动轮播（4s 间隔），带圆形指示点与左右切换箭头，悬停暂停，页面不可见时自动休眠
- **登录认证** — 双 Tab 登录面板（账号密码 / 手机验证码），正则实时校验（邮箱/用户名/密码/手机号），验证码 60s 倒计时，模拟异步提交跳转
- **左侧悬浮个人组件** — `position: fixed` 固定在左侧垂直居中，头像悬停弹跳动画（`@keyframes avatarBounce`），点击跳转"关于我"页面；≤1024px 自动隐藏
- **分类折叠** — 子页面内容卡片支持展开/收起动画，IntersectionObserver 滚动淡入
- **资源导航** — 玻璃拟态卡片网格，图标加载失败自动回退默认图（`data-default-src` + `onerror` 回退机制）
- **表单验证** — 留言板实时正则校验邮箱格式，非空完整性检查
- **图片画廊** — CSS Grid `dense` 自动填充，长短图错落排版，控制面板动态调整参数；自适应图片尺寸边框，边缘色提取泛光效果
- **画廊批处理** — Python 脚本自动整理图片文件、增量更新 gallery.html，统一图片可识别信息
- **设计工具导航** — 视觉设计子页面集成 Adobe Photoshop / Illustrator / Figma / Canva / 优设网 / 站酷 六大设计工具入口
- **星空背景** — 多层径向渐变 + CSS 动画，固定定位 GPU 加速

## 文件说明

| 文件 | 说明 |
|------|------|
| `index.html` | 首页 v1.5.0（Logo + 轮播图 + 搜索 + 9栏导航 + 悬浮个人组件 + 页脚） |
| `pages/account/login.html` | 登录页 v1.0.0（双 Tab 切换登录 + 正则实时校验 + 玻璃拟态面板） |
| `pages/account/register.html` | 注册页 v1.0.0（用户名/邮箱/密码/确认密码校验 + 玻璃拟态面板） |
| `pages/account/forgot.html` | 找回密码 v1.0.0（邮箱验证码重置密码 + 倒计时 + 玻璃拟态面板） |
| `css/shared.css` | 全局样式表 v1.5.0（18 个模块，CSS 变量系统，亮暗双主题，轮播动画，1024px 断点） |
| `js/preview-system.js` | 悬停预览 + 轮播控制器（预览 v1.1.0 + 轮播 v1.0.0） |
| `pages/contact/contact.html` | 留言板（表单 + 正则验证） |
| `pages/gallery/gallery.html` | 图片展示 v1.0.0（灵活网格 + 控制面板 + 边缘泛光） |
| `pages/lab/lab.html` | 实验特效页（灵活网格图片展示 v1/v2） |
| `pages/design/designmainpage.html` | 视觉设计类 v2.0.0（设计工具网格 + UI/UX / 配色排版 / AI绘画 / 平面设计 / 动效3D 五分类） |
| `pages/self/self.html` | 关于我（头像预览 + GitHub 跳转 + 个人简介） |
| `images/banner/` | 轮播图 Banner 素材（5 张） |
| `images/icon/` | 搜索引擎图标 & Logo 图标（web-icon-Bing/Google/Github/BaiDu/start.png） |
| `batch_processing/` | 批处理脚本（画廊图片整理、增量更新 HTML） |
| `fonts/` | 商免字体 |

## 设计风格

以"星云"为视觉核心，暗色模式为主 —— 深空蓝渐变背景 + 星云绿（`#b6da3e`）主题色 + 玻璃拟态半透明卡片。左侧悬浮个人组件增强浏览体验。亮色模式通过 `prefers-color-scheme` 自动切换，保证不同光照环境下的可读性。

## 更新日志

### v1.5.0 
- feat: Banner 改造为轮播图（5 张图片，淡入淡出，指示点 + 箭头 + 悬停暂停 + 4s 自动播放）
- feat: 新增登录页面 `pages/account/login.html`（双 Tab 切换 / 账号密码登录 + 手机验证码登录 / 正则实时校验 / 模拟异步跳转）
- refactor: 静态资源规范化目录整理（`shared.css` → `css/`，`preview-system.js` → `js/`）
- refactor: 轮播 JS 逻辑合并至 `preview-system.js`（IIFE 模块，visibilitychange 节能）
- refactor: 移除 `pages/design/yingchun.html`（OC 角色展示页）及其所有跳转链接

### v1.4.0
- feat: Logo 由内联 SVG 替换为 `web-icon-start.png` 图片
- feat: 搜索引擎图标更新为 `images/icon/web-icon-*.png`，修正百度搜索 URL
- feat: 个人组件改为左侧悬浮固定定位（`position: fixed`），头像悬停弹跳动画
- refactor: 移除悬浮组件双按钮，点击头像直达"关于我"页面
- feat: 首页新增 3 个栏目导航卡片（留言板 / 图片展示 / 实验特效），共 9 卡
- refactor: 设计子页面全面重构为设计工具 + 五分类设计内容
- feat: 全站外链图标统一 `data-default-src` + `onerror` 回退机制
- feat: 新增 `images/icon/` 目录存放 Logo 及搜索引擎图标
- fix: 子页面返回首页链接改为相对路径
- fix: 移除 aigcmainpage DeepSeek 重复条目
- fix: 修正 designmainpage Lua 卡片内容
- fix: 补全 self.html 空白页面
- fix: lab.html 内部链接改为相对路径

### v1.3.0 
- refactor: 重构首页布局，增加 Logo/Banner/栏目导航卡片/页脚
- feat: 添加内联 SVG 星云 Logo
- feat: 添加 6 个栏目导航卡片（程序开发/人工智能/视觉设计/工具资源/学习笔记/关于我）
- fix: 修复 AI 智能体区域重复条目及残损 URL

## 部署

项目托管于 GitHub Pages，`main` 分支即部署分支。本地开发可使用 VS Code Live Server 插件预览。

## 致谢

- [PhotoShow](https://github.com/Mr-VincentW/PhotoShow/tree/archive) — 悬停预览系统参考
