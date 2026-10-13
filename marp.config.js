/**
 * Marp CLI 配置
 * 文档：https://github.com/marp-team/marp-cli/blob/main/docs/configuration-files.md
 *
 * 把构建选项集中放在这里，命令行就不必重复传参
 * （注意：--theme-set 是数组参数，写在命令行会吞掉后续的输入文件，故放此处）
 */
module.exports = {
  // 使用自定义引擎（emoji 原生渲染，保证离线可用）
  engine: './marp-engine.js',
  // 允许 Markdown 中引用本地图片等资源
  allowLocalFiles: true,
  // 允许在 Markdown 中直接书写 HTML
  html: true,
  // 注册自定义主题文件
  themeSet: ['themes/copilot.css'],
  // 导出 PDF 时生成书签大纲
  pdfOutlines: true,
  // 若自动探测不到浏览器，可改为 'edge' 或 'chrome'
  // browser: 'edge',
};
