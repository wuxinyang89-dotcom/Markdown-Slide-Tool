#!/usr/bin/env node
/**
 * 把导出的 HTML 中的本地资源（图片、字体等）内联为 data URI，
 * 使 dist/index.html 成为可单独分发、完全离线的单文件演示。
 *
 * 用法：node scripts/inline-assets.mjs <html文件> <资源基准目录>
 *   例：node scripts/inline-assets.mjs dist/index.html slides
 *
 * 说明：Markdown 中的相对路径（如 images/a.png）是相对 slides/ 解析的，
 *       而输出位于 dist/，因此必须内联，否则在 dist/ 下会找不到文件。
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const [, , htmlArg = 'dist/index.html', baseArg = 'slides'] = process.argv;

const htmlPath = path.resolve(htmlArg);
const baseDir = path.resolve(baseArg);

const MIME = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.bmp': 'image/bmp',
  '.css': 'text/css',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
};

/** 绝对 URL、协议相对 URL、data URI、纯锚点都跳过 */
const isExternal = (url) => /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url);

let html = await readFile(htmlPath, 'utf8');

let inlined = 0;
let missing = 0;
const jobs = [];

for (const match of html.matchAll(/\b(src|href)="([^"]+)"/g)) {
  const [full, attr, url] = match;
  if (isExternal(url)) continue;

  const relative = decodeURIComponent(url.split(/[?#]/)[0]);
  const file = path.resolve(baseDir, relative);

  if (!existsSync(file)) {
    missing += 1;
    console.warn(`[inline] 跳过（未找到）: ${relative}`);
    continue;
  }

  const mime = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const base64 = (await readFile(file)).toString('base64');
  jobs.push([full, () => `${attr}="data:${mime};base64,${base64}"`]);
}

for (const [needle, makeReplacement] of jobs) {
  html = html.replace(needle, makeReplacement);
  inlined += 1;
}

await writeFile(htmlPath, html, 'utf8');

console.log(
  `[inline] ${path.relative(process.cwd(), htmlPath)} — 已内联 ${inlined} 个资源，缺失 ${missing} 个`
);
