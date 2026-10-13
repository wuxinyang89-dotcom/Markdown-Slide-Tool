/**
 * 自定义 Marp 引擎
 *
 * 目的：把 emoji 渲染为系统原生字符，而不是 Marp 默认的 twemoji 远程图片。
 * 这样导出的 HTML 不含任何外部 CDN 请求，可完全离线演示。
 */
const { Marp } = require('@marp-team/marp-core');

class OfflineMarp extends Marp {
  constructor(opts = {}) {
    super({
      ...opts,
      emoji: { unicode: 'native' },
    });
  }
}

module.exports = OfflineMarp;
