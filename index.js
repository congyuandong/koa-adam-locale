'use strict';

require('./lib/adam/polyfill/Array');
const Path = require('path');
const debug = require('debug')('koa-adam-locale');
const Locale = require('./lib/adam/locale/locale');
const View = require('koa-views');

const languageSupported = [{
  code:'en-us',
  lang:'English'
},{
  code:'zh-cn',
  lang:'中文简体'
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

  debug('opts.path. path:'+opts.path);
  for(var i in opts.supported) {
    var code = opts.supported[i].code;
    debug('opts.supported. code:'+code);
    var content = require(Path.resolve(opts.path, code)) || {};
    kal.define(code, content);
  }
  app.kal = kal;

  return function *(next) {
    this.locals = this.locals || {};
    if(this.locals._i18n_ || this.locals._i18n_current_ || this.locals._i18n_supported_) {
        yield next;
    }

    if(this.path == opts.set_url) {
      var lang = this.request.query.lang;
      this.session.kal_i18n_current = lang;
      debug('set session.kal_i18n_current:'+lang);
      this.redirect('/');
    }else {
      this.locals._i18n_current_ = this.session.kal_i18n_current;
      debug('set locals._i18n_current_:'+this.locals._i18n_current_);
      this.app.kal.use(this.locals._i18n_current_);
      this.locals._i18n_ = this.app.kal.get();
      this.locals._i18n_supported_ = opts.supported;
      yield next;
    }
  }
}