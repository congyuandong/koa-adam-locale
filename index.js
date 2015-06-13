/**!
 * koa-adam-locale - index.js
 *
 * Authors:
 *   meikidd <meikidd@gmail.com>
 */

'use strict';

require('./lib/adam/polyfill/Array');
const Resolve = require('path').resolve;
const debug = require('debug')('koa-adam-locale');
const Locale = require('./lib/adam/locale/locale');

const languageSupported = [{
  code:'en-us',
  lang:'English'
}];

module.exports = function(opts, app){

  var kal = Locale('koa-adam-locale');
  if (opts && typeof opts.use === 'function') {
    var tmp = app;
    app = opts;
    opts = tmp;
  }

  opts.supported = opts.supported || languageSupported;
  opts.set_url = opts.set_url || '/set_locale';
  opts.default = opts.default || opts.supported[0].code;
  opts.cookies = opts.cookies || {};

  debug('opts.path. path:'+opts.path);
  opts.supported.forEach(function(l) {
    var code = l.code;
    debug('opts.supported. code:'+code);
    var content = require(Resolve(opts.path, code)) || {};
    kal.define(code, content);
  });

  app.kal = kal;

  if(!app.keys) app.keys = ['koa-adam-locale'];


  return function *(next) {
    var namespace = opts.namespace || 'locals';
    this[namespace] = this[namespace] || {};

    if(this.path == opts.set_url) {
      var lang = this.request.query.lang;
      this.cookies.set('kal_i18n_current', lang, opts.cookies);
      debug('set cookie kal_i18n_current: %s', lang);
      this.redirect('back', '/');
    }else {
      this[namespace]._i18n_current_ = this.cookies.get('kal_i18n_current', opts.cookies) || opts.default;
      debug('set _i18n_current_: %s', this[namespace]._i18n_current_);
      this.app.kal.use(this[namespace]._i18n_current_);
      this[namespace]._i18n_ = this.app.kal.get();
      this[namespace]._i18n_supported_ = opts.supported;
      yield next;
    }
  }
}