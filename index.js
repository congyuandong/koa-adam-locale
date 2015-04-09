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
const View = require('koa-views');

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

  debug('opts.path. path:'+opts.path);
  opts.supported.forEach(function(l) {
    var code = l.code;
    debug('opts.supported. code:'+code);
    var content = require(Resolve(opts.path, code)) || {};
    kal.define(code, content);
  });
  app.kal = kal;

  return function *(next) {
    this.locals = this.locals || {};

    if(this.path == opts.set_url) {
      var lang = this.request.query.lang;
      this.session.kal_i18n_current = lang;
      debug('set session.kal_i18n_current:'+lang);
      this.redirect('back', '/');
    }else {
      this.locals._i18n_current_ = this.session.kal_i18n_current || opts.default;
      debug('set locals._i18n_current_:'+this.locals._i18n_current_);
      this.app.kal.use(this.locals._i18n_current_);
      this.locals._i18n_ = this.app.kal.get();
      this.locals._i18n_supported_ = opts.supported;
      yield next;
    }
  }
}