<!--
  ══════════════════════════════════════════════════════════════════════════════
   AI-GENERATED FILE
   本 README 由 GitHub Copilot 生成与维护
   （生成时使用模型：DeepSeek V4.1 Flash）
   内容未经人工逐句校对，描述可能与代码实际行为存在偏差。
   如有疑问，请以源码为准：scripts/build.mjs
  ══════════════════════════════════════════════════════════════════════════════
-->

# 📽️ Markdown PPT

> ### 🤖 本文档由 AI 生成
>
> 本 README 由 **GitHub Copilot** 撰写（生成时使用模型：**DeepSeek V4.1 Flash**），
> **未经人工逐句校对**。若描述与程序实际行为不一致，**以源码为准** ——
> 构建逻辑集中在 `scripts/build.mjs`，说明见 [实现说明](#实现说明)。
>
> 欢迎直接修改、删改或重写本文件。

**用 Markdown 写幻灯片**，一条命令导出 **HTML / PDF / PPTX**，多套演示统一管理。

| 特性 | 说明 |
| :--- | :--- |
| 🎨 **5 套现成主题** | 通用蓝 / 学术纸感 / 冷静极简 / 暗色终端 / 杂志编辑，换主题不动内容 |
| 📝 **内容与样式分离** | 内容在 `decks/`，样式在 `themes/`，改一次全部生效 |
| 📦 **多套管理** | 一套演示 = 一个文件夹，想加多少加多少 |
| ✈️ **离线单文件** | 导出的 HTML 把样式与图片全内联进去，拷到任意电脑双击即放，**不联网、不装任何东西** |
| 🔤 **中文友好** | 界面、路径、菜单全支持中文，菜单按 CJK 宽度对齐 |
| 🖥️ **三平台** | Windows / macOS / Linux 各有一个启动脚本 |
| 🧩 **零外部图表库** | 所有图表是纯 HTML + CSS，导出的 HTML 天然离线、体积小 |

---

## 目录

- [三步上手](#三步上手)
- [系统要求](#系统要求)
- [常用命令](#常用命令)
- [新增一套演示](#新增一套演示)
- [目录结构](#目录结构)
- [怎么写内容](#怎么写内容)
- [改主题](#改主题)
- [图表组件](#图表组件)
- [分发与演示](#分发与演示)
- [上传到 Git 前必读](#上传到-git-前必读)
- [常见问题](#常见问题)
- [实现说明](#实现说明)

---

## 三步上手

```bash
# 1. 装依赖（只做一次，需要联网）
npm install

# 2. 生成
#    Windows          → 双击 build.bat
#    macOS / Linux    → ./build.sh

# 3. 打开 dist/，取走你需要的那份
```

生成后 `dist/` 里会出现：

```text
dist/
├─ 2026-10-09-社交媒体禁令.html    ← 离线单文件，发给任何人都能直接放
├─ 2026-10-09-社交媒体禁令.pdf     ← 矢量，带书签
└─ 2026-10-09-社交媒体禁令.pptx    ← 每页为图片，视觉 100% 一致
```

---

## 系统要求

| 依赖 | 是否必需 | 说明 |
| :--- | :--- | :--- |
| **Node.js ≥ 18** | ✅ 必需 | 已验证 v24 + npm v11 可用 |
| **Chrome 或 Edge** | 仅 PDF / PPTX | 用于渲染；**只导出 HTML 时不需要** |
| npm | ✅ 必需 | 随 Node.js 一起安装 |

安装依赖：

```bash
npm install
```

<details>
<summary><b>各平台注意事项</b>（点开）</summary>

**Windows**

- 若 PowerShell 报 `npm.ps1 无法加载`（执行策略限制），把命令里的 `npm` 换成 `npm.cmd` 即可，**不需要管理员权限**。
- `build.bat` 已内置 `chcp 65001`，中文不会乱码。

**macOS**

- 首次使用需赋可执行权限：
  ```bash
  chmod +x build.sh build.command
  ```
- 之后可直接在访达里**双击 `build.command`**。
- 如果提示"来自未验证的开发者"，右键 → 打开，或执行：
  ```bash
  xattr -d com.apple.quarantine build.sh build.command
  ```

**Linux**

- 同样需要 `chmod +x build.sh`。
- 无图形界面的服务器（没有 Chrome/Edge）只能导出 HTML，PDF/PPTX 会失败。

</details>

---

## 常用命令

三个平台的能力完全一致，区别只在于启动脚本：

| 目的 | Windows | macOS / Linux |
| :--- | :--- | :--- |
| **交互菜单** | 双击 `build.bat` | `./build.sh` |
| 全部演示 × 全部格式 | `build.bat all` | `./build.sh all` |
| 全部演示 × 仅 HTML | `build.bat html` | `./build.sh html` |
| 全部演示 × 仅 PDF | `build.bat pdf` | `./build.sh pdf` |
| 全部演示 × 仅 PPTX | `build.bat pptx` | `./build.sh pptx` |
| 列出所有演示 | `build.bat list` | `./build.sh list` |
| 清空 `dist/` | `build.bat clean` | `./build.sh clean` |
| 实时预览 | `build.bat preview` | `./build.sh preview` |
| **只构建某几套** | `build.bat 2026-10-09 pdf` | `./build.sh 2026-10-09 pdf` |

> 💡 筛选关键字用**日期前缀**最方便（纯 ASCII，不用切输入法），例如 `build.bat 2026-10-09`。
> 关键字是"名字里包含"匹配，可以同时命中多套。

### 交互菜单

不带参数启动（双击 `build.bat` / `build.command`）会进入菜单，**页数是实时统计的**，
一眼就能看出哪套还没写完：

```text
  ============================================================
              Markdown PPT   批量生成工具
  ============================================================
  共发现 3 套演示（decks\ 目录）

     [ 1]  2026-10-09-社交媒体禁令         19 页
     [ 2]  2026-10-20-群体极化             16 页
     [ 3]  2026-11-05-xxx                 12 页
     ----------------------------------------------
     [A] 全部构建        [L] 详细列表
     [C] 清空 dist       [0] 退出
  ============================================================
     输入编号后按回车（0 退出）:
```

| 输入 | 作用 |
| :--- | :--- |
| `1` `2` `3` … | 只构建那一套（三种格式全出） |
| `a` | 构建全部演示 |
| `l` | 详细列表（含图片数量） |
| `c` | 清空 `dist/` |
| `0` | 退出 |

### npm 命令（等效，三平台通用）

| 命令 | 作用 |
| :--- | :--- |
| `npm run build` | 全部演示 × HTML + PDF + PPTX |
| `npm run build:html` | 全部演示 × 仅 HTML |
| `npm run build:pdf` | 全部演示 × 仅 PDF |
| `npm run build:pptx` | 全部演示 × 仅 PPTX |
| `npm run list` | 列出所有演示 |
| `npm run clean` | 清空 `dist/` |
| `npm run preview` | 实时预览 |

> 在 VS Code 里也可以用「终端 → 运行任务」直接调用，
> 任务名以 `PPT:` 开头（见 `.vscode/tasks.json`）。

---

## 新增一套演示

**一条路：复制 `templates/` → 改名 → 开始写。**

```text
① 复制整个 templates 文件夹到 decks/ 下

   templates/                  decks/2026-10-20-群体极化/
   ├─ deck.md          ──▶     ├─ deck.md
   └─ images/                  └─ images/

② 文件夹名用「日期-主题」

③ 打开 deck.md，改 front-matter 里的页眉页脚与封面信息，然后开始写
```

就这么三步。**不用改任何配置** —— 构建脚本会自动扫描 `decks/` 下的所有文件夹，
产物名自动等于文件夹名。

> 📌 命名建议用「**日期-主题**」（如 `2026-10-20-群体极化`）。
> 好处：菜单里按日期自然排序，产物文件名一眼能对上，筛选时输入日期前缀即可。

`templates/主题预览.md` 里有**全部组件的实际用法**，直接照抄改字就行。

---

## 目录结构

```text
PPT/
├─ decks/                       ← 每套演示一个文件夹（可无限扩展）
│  ├─ .gitkeep                  ← 只为保留空目录
│  └─ 2026-10-09-社交媒体禁令/
│     ├─ deck.md                ← 内容，唯一需要编辑的文件
│     └─ images/                ← 该套专属图片
│
├─ templates/                   ← 新一套的复制模板
│  ├─ deck.md                   ← 起步模板（复制它来新建一套）
│  ├─ 主题预览.md               ← 全部组件用法 + 5 套主题对照
│  └─ images/pipeline.svg
│
├─ themes/                      ← 5 套主题，改 front-matter 一行即可切换
│  ├─ copilot.css               ←   默认 · 通用蓝
│  ├─ paper.css                 ←   学术纸感
│  ├─ nord.css                  ←   冷静极简
│  ├─ neon.css                  ←   暗色终端
│  └─ magazine.css              ←   杂志编辑
│
├─ scripts/
│  ├─ build.mjs                 ← 编排：扫描 / 菜单 / 批量构建
│  └─ inline-assets.mjs         ← 构建后处理：把本地图片内联进 HTML
│
├─ dist/                        ← 产物 <文件夹名>.html / .pdf / .pptx（不入库）
│
├─ build.bat                    ← Windows 启动器（纯 ASCII）
├─ build.sh                     ← macOS / Linux 启动器
├─ build.command                ← macOS 双击入口，转发给 build.sh
│
├─ marp.config.js               ← 构建配置（主题注册、HTML、本地文件）
├─ marp-engine.js               ← 自定义引擎（emoji 原生渲染，保证离线）
├─ package.json
├─ .gitignore                   ← 默认不上传 decks/ 与 dist/
├─ .gitattributes               ← 统一行尾（shell 脚本 LF，bat CRLF）
└─ README.md                    ← 本文件（AI 生成）
```

---

## 怎么写内容

打开某套的 `deck.md`。最上方是 **front-matter**，之后每页之间用 `---` 分隔：

```markdown
---
marp: true
theme: copilot
paginate: true
size: 16:9
html: true
header: '**页眉文字**'
footer: '页脚文字'
---

# 第一页标题

- 要点一
- 要点二

---

## 第二页
```

> ⚠️ 每套的 front-matter 是**独立**的 —— 页眉页脚、主讲人信息各写各的。
> （从 `templates/` 复制时已经带过来了，改一下即可。）

### 版式指令

| 写法 | 效果 |
| :--- | :--- |
| `<!-- _class: lead -->` | 封面页（深色渐变、居中、自动隐藏页眉页脚） |
| `<!-- _class: divider -->` | 章节分隔页（深色、居中） |
| `<!-- _class: compact -->` | 紧凑版式（自动收紧表格与列表间距） |
| `<!-- _paginate: false -->` | 本页不显示页码 |
| `<!-- _header: '' -->` | 本页清空页眉 |

> 内容偏多的页，在页首加 `<!-- _class: compact -->` 通常就能避免溢出。

### 页数与时长估算

页数是**数 `---` 分隔符**得出的（`build.bat list` 会显示）：

$$
\text{页数} = \text{分隔符数} - 1
$$

按普通话速约 **150–180 字/分钟**估算：

| 时长 | 讲稿字数 | 建议页数 |
| :--- | :--- | :--- |
| 10 分钟 | 1500–1800 字 | 12–14 页 |
| 15 分钟 | 2300–2700 字 | 18–20 页 |
| 20 分钟 | 3000–3600 字 | 22–26 页 |

### 分栏布局

在 HTML `div` 里写 Markdown 时，**块级标签后要留空行**，Markdown 才会被解析：

```markdown
<div class="columns">
<div>

### 左栏

- 内容 A

</div>
<div>

### 右栏

- 内容 B

</div>
</div>
```

### 图片

```markdown
![w:800](images/your-image.png)
```

- `w:` / `h:` 指定宽度或高度（像素），不写则按原尺寸
- 图片放在**本套的** `decks/<名字>/images/` 下
- 构建时会自动内联进 HTML，所以产物依然是单文件

---

## 改主题

主题文件都在 `themes/` 下。**换主题不需要改动任何内容** —— 只改 `deck.md` 顶部一行。

### 现成的 5 套主题

| 主题 | 气质 | 适合场合 | 特点 |
| :--- | :--- | :--- | :--- |
| `copilot` | 通用蓝（默认） | 大多数场合，最稳妥 | 深色渐变压面、圆角卡片、渐变条形图 |
| `paper` | 学术纸感 | 人文社科、论文汇报 | 暖白纸底、衬线字体、砖红点缀、booktabs 表格 |
| `nord` | 冷静极简 | 技术汇报、数据说明 | 冷灰蓝、大留白、扁平无渐变、胶囊条形图 |
| `neon` | 暗色终端 | 技术分享、开源介绍 | 近黑底、霓虹青紫、等宽字体、纯 CSS 网格封面 |
| `magazine` | 杂志编辑 | 演讲、路演、观点输出 | 超大粗体标题、纯黑封面、玫红色块、黑底表头 |

切换方式 —— 打开 `decks/<名字>/deck.md`，改 front-matter 里的这一行：

```yaml
theme: nord      # 换成任意一个主题名即可
```

> 📖 **想直观比较？** 把 `templates/主题预览.md` 复制成一套演示，
> 依次改 `theme:` 重新生成就能逐套对照。
> 这份文件同时是**全部组件的用法参考**。

### 五套主题共用同一套组件类

这是刻意的设计：`.timeline` / `.bars` / `.cards` / `.compare` / `.stat` / `.big-q` /
`.refs` / `.compact` 在各主题里**类名完全一致**，只是配色与造型不同。

所以**换主题不需要动内容**，一份 `deck.md` 可以在 5 套主题间任意切换。

### 改配色

每套主题开头都有一个变量区，改这里即可整体换色（以 `copilot.css` 为例）：

```css
section {
  --accent:      #2f6fed;   /* 主色        */
  --accent-2:    #56ccf2;   /* 渐变辅色    */
  --accent-soft: #e8f0fe;   /* 浅色底      */
  --accent-ink:  #1b3a8f;   /* 主色深字    */
  --ink:         #0d1526;   /* 正文色      */
  --muted:       #6b7a90;   /* 次要文字    */
  --line:        #dfe6ef;   /* 分隔线      */
}
```

字体刻意只用**系统字体**（`Segoe UI` / `Microsoft YaHei` / `PingFang SC` / `Georgia` …），
不引用任何 Web Font —— 这样离线打开不会字体回退、也不会发网络请求。

### ⚠️ 一个容易踩的坑：表格斑马纹

Marp 内置主题用这条规则给偶数行上色：

```css
div#:$p > svg > foreignObject > section table tr:nth-child(2n) {
  background-color: var(--bgColor-muted);
}
```

它**带 id 选择器、特异性极高**，写 `tbody tr:nth-child(even)` 是**覆盖不掉**的。
麻烦的是 `--bgColor-muted` 的默认值为 `light-dark(#f6f8fa, #151b23)` ——
深色主题若不声明 `color-scheme: dark`，它会解析成**浅色值**，
于是在深色背景上出现一行浅底浅字。

**正确做法是重定义变量，而不是硬拼特异性：**

```css
section {
  --bgColor-muted: rgba(255, 255, 255, 0.03);   /* 深色主题的斑马纹 */
  color-scheme: dark;                            /* 让 light-dark() 走深色分支 */
}
```

5 套主题都已处理（`paper` 设成 `transparent`，因为 booktabs 风格不需要斑马纹）。

<details>
<summary><b>想加一套全新主题？</b>（点开）</summary>

1. 复制任意一个主题文件，把**首行**改成你的主题名：
   ```css
   /* @theme my-theme */
   @import 'default';
   ```
2. 在 `marp.config.js` 的 `themeSet` 数组里登记它：
   ```js
   themeSet: ['themes/copilot.css', 'themes/paper.css', /* … */ 'themes/my-theme.css'],
   ```
3. 在该套 `deck.md` 的 front-matter 里写：
   ```yaml
   theme: my-theme
   ```
4. 建议保留原有组件类名（`.timeline` / `.bars` / …），这样内容可以直接复用。

</details>

---

## 图表组件

5 套主题都内置同一套数据展示组件，全部是**纯 HTML + CSS**，
不依赖任何外部图表库 —— 所以导出的 HTML 天然离线、体积小、不会因为 CDN 挂掉而变空白。

> ⚠️ **在 HTML 块内请使用 HTML 标签**（`<b>` `<em>` `<code>`），
> 不要写 Markdown 语法 —— HTML 块内部的 Markdown **不会被解析**。
> 块与标签之间保留空行，块**外**的 Markdown 才正常生效。

| 组件 | 类名 | 用途 |
| :--- | :--- | :--- |
| 时间轴 | `.timeline` › `.tl-item`（`.is-alert` 红色高亮） | 事件时间线 |
| 条形图 | `.bars` › `.bar-row` › `.bar-label` / `.bar-line` › `.bar-track` › `.bar-fill` | 比例、百分比对比 |
| 条形图配色 | `.bar-fill.is-warn`（红橙） / `.is-mute`（灰蓝） | 反方 / 次要 |
| 卡片网格 | `.cards`（`.cards-2` 为两列）› `.card` | 并列要点 |
| 左右对比 | `.compare` › `.cmp-a` / `.cmp-b` | 正反证据对照 |
| 关键数字 | `.stat` › `.stat-unit` | 突出单个统计量 |
| 大字提问 | `.big-q` | 抛出问题、立论点 |
| 数据来源注 | `.bar-src` | 标注出处与数据局限 |
| 参考列表 | `.refs` | 文末参考文献 |

**条形图示例**（条宽用行内 `style` 控制）：

```html
<div class="bars">
<div class="bar-row">
<div class="bar-label">支持率</div>
<div class="bar-line">
  <div class="bar-track"><div class="bar-fill" style="width:58%"></div></div>
  <div class="bar-val">58%</div>
</div>
</div>
</div>
```

**卡片网格示例**：

```html
<div class="cards cards-2">
<div class="card">

### 卡片标题

正文内容

</div>
<div class="card">

### 另一张

正文内容

</div>
</div>
```

> 📖 想直接抄？打开 `templates/主题预览.md` —— 每个组件都有可运行的实例，
> 而且同一份内容在 5 套主题下都能渲染，方便逐套对照。

---

## 分发与演示

### 播放

| 操作 | 按键 |
| :--- | :--- |
| 上一页 / 下一页 | `←` `→`（也支持空格、PageUp/PageDown） |
| 全屏 | `F` |
| 缩略图总览 | `O` |
| 演讲者视图 | `P` |

### 分发

`dist/<名字>.html` 是**自包含单文件**：样式内联、图片内联为 data URI、
字体全用系统字体。所以：

- 拷贝到任意电脑，**双击即放**
- **不需要联网**，不需要装 Node、不需要装任何东西
- 可以直接发邮件、丢进 U 盘、传网盘

> ✅ **自测方法：断网，然后双击打开。** 功能应当完全正常。
>
> 之所以能做到：`marp-engine.js` 把 emoji 改成系统原生渲染
> （否则 marp 会去 CDN 取 twemoji 图片），`scripts/inline-assets.mjs`
> 把本地图片内联为 data URI。构建日志若出现「缺失 N 个」，说明有图片路径写错了。

### PDF 与 PPTX

| 格式 | 特点 | 适合 |
| :--- | :--- | :--- |
| HTML | 单文件、可交互、体积小 | 自己讲、发给人自己翻 |
| PDF | 矢量、带书签大纲 | 打印、上交、存档 |
| PPTX | 每页为图片，**视觉 100% 一致** | 需要提交 `.pptx` 的场合 |

> PPTX 每页是图片，所以里面的文字**不能编辑** —— 这是为了保证排版不走样。
> 若确实需要可编辑版本，见 [常见问题](#常见问题)。

---

## 上传到 Git 前必读

这个仓库**默认只上传「工具」，不上传「你的内容」**。

原因很直接：`decks/<名字>/deck.md` 里通常写着**主讲人姓名、学号、班级**，
推上去就等于把这些信息公开了。

### `.gitignore` 默认挡掉了什么

| 被忽略 | 原因 |
| :--- | :--- |
| `decks/*`（保留 `decks/.gitkeep`） | **你的个人课件**（姓名 / 学号 / 班级） |
| `dist/` | 构建产物，可随时重新生成，且体积大 |
| `node_modules/` | 依赖，`npm install` 可重建 |
| `*.pptx` `*.key` | 私人素材原件 |
| `.DS_Store` `Thumbs.db` `*.swp` 等 | 系统与编辑器垃圾文件 |

### 上传前自检（30 秒）

```bash
git status --short          # 准备提交哪些文件 —— 确认没有 decks/ 里的内容
git ls-files                # 真正被跟踪的文件 —— 最终以它为准
git check-ignore -v decks   # 是哪条规则挡住的
```

### ⚠️ 两个容易踩的坑

**坑 1：`.gitignore` 只对「尚未被跟踪」的文件生效。**

如果某个课件之前已经 `git add` 过，后面再改 `.gitignore` 是**拦不住**的，
必须从索引里移除（本地文件不会删）：

```bash
git rm -r --cached "decks/你的文件夹名"
git commit -m "stop tracking private deck"
```

**坑 2：历史里的东西删不干净。**

一旦含个人信息的文件被 push 过，**它永久留在 git 历史里**，
后续 commit 删除也依然能被翻出来。真出事了需要重写历史
（`git filter-repo`）或直接删库重建。

**结论：第一次 push 前务必 `git ls-files` 看一遍。**

### 想让某一套公开？

在 `.gitignore` 末尾取消注释那两行放行规则，改成你的文件夹名：

```gitignore
!decks/2026-10-09-社交媒体禁令/
!decks/2026-10-09-社交媒体禁令/**
```

> 放行前请**务必**确认该套 `deck.md` 里没有任何个人信息。

---

## 常见问题

<details>
<summary><b>Q：报 <code>EBUSY: resource busy or locked</code>？</b></summary>

目标文件正被 WPS / PowerPoint 打开着。关掉它，重新构建即可。

</details>

<details>
<summary><b>Q：导出 PDF / PPTX 时报找不到浏览器？</b></summary>

安装 Chrome 或 Edge。若已安装但仍失败，在 `marp.config.js` 里取消注释
`browser: 'edge'`（或 `'chrome'`），或指定 `browserPath`。

</details>

<details>
<summary><b>Q：PPTX 打开后文字不能编辑？</b></summary>

默认导出为保证视觉 100% 一致，每页是图片。如需可编辑文字，
给 `pptx` 加上 `--pptx-editable` 参数：在 `scripts/build.mjs` 的 `buildOne()` 里，

```js
if (format !== 'html') args.push('--' + format);
// 改成：
if (format === 'pptx') args.push('--pptx', '--pptx-editable');
else if (format === 'pdf') args.push('--pdf');
```

这是实验特性，版式可能会有微调。

</details>

<details>
<summary><b>Q：图片在 HTML 里显示不出来？</b></summary>

确认图片放在**本套的** `images/` 目录，且引用写成 `images/xxx.png`
（相对 `deck.md` 所在目录）。构建日志若提示「跳过（未找到）」，说明路径写错了。

</details>

<details>
<summary><b>Q：构建日志出现「缺失 N 个」？</b></summary>

有 N 个本地资源没找到。检查文件名大小写与相对路径 ——
Windows 不区分大小写，但 Linux/macOS 区分。

</details>

<details>
<summary><b>Q：macOS 上 <code>./build.sh</code> 报 <code>bad interpreter</code> 或 <code>$'\r': command not found</code>？</b></summary>

行尾变成了 CRLF。`.gitattributes` 已把 `*.sh` / `*.command` 固定为 LF，
从 git 克隆下来不会有这个问题；若是直接拷贝文件夹导致的，执行：

```bash
sed -i '' $'s/\r$//' build.sh build.command
```

</details>

<details>
<summary><b>Q：<code>build.bat</code> 双击后中文乱码 / 报"不是内部或外部命令"？</b></summary>

`build.bat` 是**纯 ASCII** 的，本身不会因编码出错。若真出现乱码，
多半是文件被编辑器改存成了 UTF-8 且加了 BOM，或路径被改动。
恢复原始内容即可（见 [实现说明](#实现说明) 解释它为什么必须是 ASCII）。

</details>

<details>
<summary><b>Q：想在 VS Code 里所见即所得地编辑？</b></summary>

安装扩展 **Marp for VS Code**（`.vscode/extensions.json` 已推荐），
打开任意 `deck.md`，点右上角的预览图标即可实时预览。

</details>

---

## 实现说明

> 本节解释"为什么这么设计"，帮助你修改时不踩坑。

### 为什么编排逻辑在 Node 里，而不是各平台的脚本里

这是本项目最关键的一个设计决定 —— 三个启动脚本都**极薄**，真正的逻辑全在
`scripts/build.mjs`。原因：

| 原因 | 说明 |
| :--- | :--- |
| **中文路径** | `cmd.exe` 对含中文的 `.bat` 会因代码页不匹配而**解析错位**（把菜单行当命令执行）。Node 处理 Unicode 路径毫无问题 |
| **动态菜单** | 菜单要实时扫描 `decks/` 并列出，静态批处理做不到 |
| **输入体验** | 批处理的 `choice` 按到集合外的键会**蜂鸣**（实际经历过的坑）；Node 的 `readline` 不会 |
| **三平台一致** | 一套逻辑同时服务 Windows / macOS / Linux，不会三份代码慢慢跑偏 |

所以 `build.bat` 只是个 20 行启动器：`chcp 65001` → `node scripts/build.mjs %*`。
`build.sh` 同理：定位自身目录 → 检查 node → 转发参数。

### 为什么 `build.bat` 必须是纯 ASCII

`cmd.exe` 在脚本**启动时**就锁定整份 `.bat` 的解码方式，并且**按字节偏移逐行重读**。
如果文件含多字节（中文）字符，而控制台代码页与文件编码不匹配，
字节就会错位 —— 后续的行会被从中间截断，然后**当作命令去执行**，
表现为一堆乱码加 `'xxx' 不是内部或外部命令`。

把 `chcp 936` 写进脚本里也没用（解码方式已经定了）；改成 UTF-8 存盘更会把
`cmd` 的 65001 字节偏移 bug 引出来。

**纯 ASCII 的脚本完全不受代码页影响**，因为它只有单字节字符。
这就是全部中文提示都放在 `scripts/build.mjs` 里的原因。

> `build.sh` 则**不需要**遵守这条 —— bash 按原始字节读取脚本，
> 不会拿控制台代码页去重新定位，UTF-8 完全安全。
> 两个平台的差异，根源在这里。

### 两个踩过的坑（已规避）

**坑 1：`--theme-set` 是数组类型参数。**

写在命令行上会**吞掉后面的输入文件**（表现为 marp 打印帮助且退出码为 0，像成功了一样）。
因此主题注册统一放在 `marp.config.js` 的 `themeSet` 里，不走命令行。

**坑 2：marp 默认把 emoji 换成 jsDelivr 上的 twemoji 图片。**

这会直接破坏离线能力 —— 断网后 emoji 全变成裂图。
修法是在自定义引擎里指定原生渲染：

```js
// marp-engine.js
super({ ...opts, emoji: { unicode: 'native' } });
```

### 关键文件一览

| 文件 | 职责 |
| :--- | :--- |
| `scripts/build.mjs` | 扫描 `decks/`、渲染菜单、调度构建、统计页数 |
| `scripts/inline-assets.mjs` | 构建后处理：把 HTML 里引用的本地资源转成 data URI |
| `marp-engine.js` | 自定义引擎，唯一作用是把 emoji 改成原生渲染 |
| `marp.config.js` | 主题注册、`allowLocalFiles`、`html: true`、PDF 书签 |
| `themes/*.css` | 5 套主题：变量区 + 全部图表组件（类名完全一致） |

---

<div align="center">

**📄 本 README 由 AI 生成** · GitHub Copilot（DeepSeek V4.1 Flash） · 2026-10-13

内容未经人工逐句校对 · 以源码为准 · 欢迎修改

</div>
