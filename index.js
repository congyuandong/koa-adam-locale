/**!
 * koa-adam-locale - index.js
 *
 * Authors:
 *   meikidd <meikidd@gmail.com>
 */

'use strict';

const Resolve = require('path').resolve;
const debug = require('debug')('koa-adam-locale');

const languageSupported = [{
  code:'en_US',
  lang:'English'
}];

module.exports = function(opts, app){

  var _i18n_packages_ = {};
  var _i18n_current_ = opts.supported[0].code;

  if (opts && typeof opts.use === 'function') {
    var tmp = app;
    app = opts;
    opts = tmp;
  }

  opts.supported = opts.supported || languageSupported;
  opts.set_url = opts.set_url || '/set_locale';
  opts.default = opts.default || opts.supported[0].code;
  opts.cookies = opts.cookies || {maxAge: 24*60*60*1000};
  opts.cookieKey = opts.cookieKey || 'i18n_current';

  debug('opts.path. path:'+opts.path);
  opts.supported.forEach(function(l) {
    var code = l.code;
    debug('opts.supported. code: %s, language: %s.', l.code, l.lang);
    var content = {};
    try {
      content = require(Resolve(opts.path, code));
    } catch(e) {
      console.error(e.stack);
    }
    _i18n_packages_[code] = content;
  });

  if(opts.cookies.signed) {
    app.keys = app.keys || [];
    app.keys.push('koa-adam-locale');
  }

  return function *(next) {
    debug('path:', this.path);
    var namespace = opts.namespace || 'locals';
    this[namespace] = this[namespace] || {};

    if(this.path == opts.set_url) {
      var lang = this.request.query.lang;
      this.cookies.set(opts.cookieKey, lang, opts.cookies);
      debug('set cookie %s: %s', opts.cookieKey, lang);
      if(this.get('X-Requested-With') === 'XMLHttpRequest') {
        this.body = {result:'ok', current:lang};
      } else {
        this.redirect('back', '/');
      }
    }else {
      this[namespace]._i18n_current_ = this.cookies.get(opts.cookieKey, opts.cookies) || opts.default;
      debug('set _i18n_current_: %s', this[namespace]._i18n_current_);
      try {
        _i18n_current_ = this[namespace]._i18n_current_;
      } catch(e) {
        console.log(e.stack);
        _i18n_current_ = opts.default;
      }
      this[namespace]._i18n_ = _i18n_packages_[_i18n_current_];
      this[namespace]._i18n_supported_ = opts.supported;
      yield next;
    }
  }
}