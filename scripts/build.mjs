#!/usr/bin/env node
/**
 * 多套演示的构建编排
 * ============================================================================
 *
 * 目录约定
 *   decks/<名字>/deck.md         一套演示（名字建议「日期-主题」）
 *   decks/<名字>/images/         该套专属图片
 *   templates/                   新一套的复制模板
 *   dist/<名字>.html|pdf|pptx    产物，文件名与 deck 文件夹同名
 *
 * 为什么编排逻辑放在 Node 里而不是批处理里
 *   1) cmd.exe 对含中文的 .bat 会因代码页不匹配而解析错位，无法可靠处理中文路径；
 *   2) 菜单要动态列出各套演示，静态批处理做不到；
 *   3) Node 的 readline 输入不会像 choice 那样在按错键时蜂鸣。
 *
 * 用法
 *   node scripts/build.mjs                    交互式菜单
 *   node scripts/build.mjs all                全部套 × 全部格式
 *   node scripts/build.mjs html               全部套，只出 HTML
 *   node scripts/build.mjs pdf | pptx         同理
 *   node scripts/build.mjs list               列出所有套（含页数）
 *   node scripts/build.mjs clean              清空 dist
 *   node scripts/build.mjs preview [关键字]   启动实时预览
 *   node scripts/build.mjs <关键字> [格式]    只构建名字含关键字的那套
 * ============================================================================
 */

import { readdirSync, existsSync, mkdirSync, rmSync, readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DECKS_DIR = path.join(ROOT, 'decks');
const DIST_DIR = path.join(ROOT, 'dist');
const MARP_JS = path.join(ROOT, 'node_modules', '@marp-team', 'marp-cli', 'marp-cli.js');
const INLINER = path.join(ROOT, 'scripts', 'inline-assets.mjs');

const FORMATS = ['html', 'pdf', 'pptx'];
const EXT = { html: '.html', pdf: '.pdf', pptx: '.pptx' };

// Windows 上确保控制台以 UTF-8 显示，否则中文提示会乱码
if (process.platform === 'win32') {
  try {
    spawnSync('chcp.com', ['65001'], { stdio: 'ignore' });
  } catch {
    /* 忽略：拿不到控制台也不影响构建 */
  }
}

/* ------------------------------------------------------------------ 工具 */

const line = (n = 60, ch = '=') => console.log('  ' + ch.repeat(n));

/** 中英文混排的显示宽度（中文按 2 列计），用于对齐菜单 */
function dispWidth(s) {
  return [...s].reduce(
    (w, c) => w + (/[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]/.test(c) ? 2 : 1),
    0
  );
}
const padTo = (s, n) => s + ' '.repeat(Math.max(1, n - dispWidth(s)));

function ensureMarp() {
  if (!existsSync(MARP_JS)) {
    console.error('\n  [错误] 找不到 marp-cli，请先在项目根目录执行：  npm install\n');
    process.exit(1);
  }
}

/** 统计页数：front-matter 的两个 --- 加上 N-1 个分页符 */
function countSlides(mdFile) {
  const text = readFileSync(mdFile, 'utf8');
  const seps = text.split(/\r?\n/).filter((l) => l.trim() === '---').length;
  return Math.max(0, seps - 1);
}

function scanDecks() {
  if (!existsSync(DECKS_DIR)) return [];
  return readdirSync(DECKS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const dir = path.join(DECKS_DIR, d.name);
      const md = path.join(dir, 'deck.md');
      const imagesDir = path.join(dir, 'images');
      return {
        name: d.name,
        dir,
        md,
        exists: existsSync(md),
        slides: existsSync(md) ? countSlides(md) : 0,
        images: existsSync(imagesDir)
          ? readdirSync(imagesDir).filter((f) => statSync(path.join(imagesDir, f)).isFile()).length
          : 0,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'zh'));
}

/* ------------------------------------------------------------ 单个构建 */

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

function buildOne(deck, format) {
  const outFile = path.join(DIST_DIR, deck.name + EXT[format]);
  const args = [MARP_JS, rel(deck.md), '-o', rel(outFile)];
  if (format !== 'html') args.push('--' + format);

  const r = spawnSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) return false;

  // HTML 需要把本地图片内联成 data URI，保证单文件可拷贝
  if (format === 'html') {
    const i = spawnSync(process.execPath, [INLINER, rel(outFile), rel(deck.dir)], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    if (i.status !== 0) return false;
  }
  return true;
}

function buildDecks(decks, formats) {
  mkdirSync(DIST_DIR, { recursive: true });
  let ok = 0;
  let fail = 0;

  for (const deck of decks) {
    if (!deck.exists) {
      console.log(`\n  [跳过] ${deck.name}：缺少 deck.md`);
      fail += 1;
      continue;
    }
    console.log('');
    line(60, '-');
    console.log(`  ${deck.name}   （${deck.slides} 页）`);
    line(60, '-');
    for (const f of formats) {
      if (!buildOne(deck, f)) fail += 1;
      else ok += 1;
    }
  }

  console.log('');
  line();
  console.log(`  完成：成功 ${ok} 项，失败 ${fail} 项`);
  if (fail > 0) {
    console.log('  常见原因：目标文件正被 WPS / PowerPoint 打开；或本机未安装 Edge / Chrome。');
  }
  line();
  return fail === 0;
}

/* ------------------------------------------------------------- 各种命令 */

function printList(decks) {
  console.log('');
  line();
  console.log(`  共 ${decks.length} 套演示   目录：decks\\`);
  line();
  if (!decks.length) {
    console.log('  （还没有任何演示。把 templates 文件夹复制到 decks\\ 下并改名即可新建一套）');
  }
  decks.forEach((d, i) => {
    const n = String(i + 1).padStart(2);
    const pages = d.exists ? `${String(d.slides).padStart(3)} 页` : '  缺 deck.md';
    const imgs = d.images ? `，${d.images} 张图` : '';
    console.log(`  [${n}]  ${padTo(d.name, 30)} ${pages}${imgs}`);
  });
  line();
}

function printMenu(decks) {
  console.log('');
  line();
  console.log('              Markdown PPT   批量生成工具');
  line();
  console.log(`  共发现 ${decks.length} 套演示（decks\\ 目录）`);
  console.log('');
  if (!decks.length) {
    console.log('  （decks\\ 下还没有演示。把 templates 文件夹复制进去、改名即可新建一套）');
  }
  decks.forEach((d, i) => {
    const n = String(i + 1).padStart(2);
    const pages = d.exists ? `${String(d.slides).padStart(3)} 页` : '  缺 deck.md';
    console.log(`     [${n}]  ${padTo(d.name, 30)} ${pages}`);
  });
  console.log('     ----------------------------------------------');
  console.log('     [A] 全部构建        [L] 详细列表');
  console.log('     [C] 清空 dist       [0] 退出');
  line();
}

const ask = (q) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, (a) => {
      rl.close();
      resolve(a.trim());
    });
  });

const waitEnter = () => ask('\n     按回车返回菜单 ...');

function clean() {
  if (!existsSync(DIST_DIR)) {
    console.log('\n  dist\\ 不存在，无需清理。');
    return;
  }
  rmSync(DIST_DIR, { recursive: true, force: true });
  console.log('\n  已清空 dist\\');
}

async function runMenu(decks) {
  for (;;) {
    printMenu(decks);
    const ans = (await ask('     输入编号后按回车（0 退出）: ')).toLowerCase();

    if (ans === '0' || ans === 'exit' || ans === 'q') {
      console.log('\n  已退出。\n');
      return;
    }
    if (ans === '') continue;

    if (ans === 'a') {
      buildDecks(decks, FORMATS);
      await waitEnter();
      continue;
    }
    if (ans === 'l') {
      printList(decks);
      await waitEnter();
      continue;
    }
    if (ans === 'c') {
      clean();
      await waitEnter();
      continue;
    }

    const idx = Number(ans);
    if (Number.isInteger(idx) && idx >= 1 && idx <= decks.length) {
      buildDecks([decks[idx - 1]], FORMATS);
      await waitEnter();
      continue;
    }
    console.log('\n     无法识别的输入，请重新选择。');
  }
}

/* ---------------------------------------------------------------- 入口 */

async function main() {
  const argv = process.argv.slice(2);
  const decks = scanDecks();
  const first = (argv[0] || '').toLowerCase();

  if (first === 'list') {
    printList(decks);
    return 0;
  }
  if (first === 'clean') {
    clean();
    return 0;
  }

  ensureMarp();

  if (first === 'preview') {
    const target = decks.find((d) => d.exists && (!argv[1] || d.name.includes(argv[1]))) || decks[0];
    if (!target) {
      console.error('\n  [错误] 没有可预览的演示（decks\\ 下缺少 deck.md）\n');
      return 1;
    }
    console.log(`\n  实时预览：${target.name}  （关闭窗口或按 Ctrl+C 结束）\n`);
    const r = spawnSync(process.execPath, [MARP_JS, '--preview', rel(target.md)], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    return r.status || 0;
  }

  if (first === 'all') return buildDecks(decks, FORMATS) ? 0 : 1;

  if (FORMATS.includes(first)) {
    if (!decks.length) {
      console.error('\n  [错误] decks\\ 下没有演示\n');
      return 1;
    }
    return buildDecks(decks, [first]) ? 0 : 1;
  }

  if (first) {
    // <关键字> [格式]
    const picked = decks.filter((d) => d.name.includes(argv[0]));
    if (!picked.length) {
      console.error(`\n  [错误] 没有名字含「${argv[0]}」的演示。用 list 查看全部。\n`);
      return 1;
    }
    const fmt = argv[1] && FORMATS.includes(argv[1].toLowerCase()) ? [argv[1].toLowerCase()] : FORMATS;
    return buildDecks(picked, fmt) ? 0 : 1;
  }

  // 无参数：交互式菜单
  if (!process.stdin.isTTY) {
    console.error(
      '\n  当前不是交互式终端，请改用参数调用，例如：\n' +
        '     node scripts/build.mjs all\n' +
        '     node scripts/build.mjs list\n'
    );
    return 1;
  }
  if (!decks.length) {
    printMenu(decks);
    console.error('\n  [错误] decks\\ 下没有演示。把 templates 文件夹复制进去并改名即可。\n');
    return 1;
  }
  await runMenu(decks);
  return 0;
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
