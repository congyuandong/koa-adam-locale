# koa-adam-locale

 Simple Multi Language Middleware for Koa.

## Installation

```js
$ npm install koa-adam-locale
```

## Example
app.js:

```js
var Path = require('path');
var View = require('koa-views')
var KAL = require('koa-adam-locale');
var koa = require('koa');
var app = koa();

/* i18n */
app.use(KAL({
  path: Path.resolve(__dirname, 'i18n'),
  cookieKey: 'current_lang',
  cookies: {
    maxAge: 365*24*60*60*1000,
    domain: 'hello.com',
    sigined: false
  },
  default: 'en_US',
  supported: [{code:'en_US', lang:'English'},{code:'zh_CN', lang:'简体中文'}]
}, app));

/* templating */
app.use(View(__dirname + '/views', {
	default: 'ejs'
}));

app.use(function * () {
	if(!this.path == '/') return;
	yield this.render('locale')
})

app.listen(process.argv[2])
```
i18n/en_US.json
```json
{
	"hello": "hello",
	"world": "world"
}
```
views/locale.ejs

```html
<p><%= _i18n_.hello %>, <%= _i18n_.world %>.</p>
<p>current:<%= _i18n_current_ %>.</p>
<% for(var i in _i18n_supported_) { %>
<a href='/set_locale?lang=<%= _i18n_supported_[i].code %>'>
	switch to <%= _i18n_supported_[i].lang %>
</a>
<% } %>
```

## Options

### path {String}
The folder path of i18n files
### supported {Array}
The supported languages. default value: `[{code:'en_US', lang:'English'},{code:'zh_CN', lang:'简体中文'}]`
#### Example:
```js
app.use(KAL({
  path: Path.resolve(__dirname, 'i18n'),
  supported: [{code:'en_US', lang:'English'},{code:'zh_CN', lang:'简体中文'}]
}, app));
```



### namespace {String}
Custom template data params namespace. Default value is 'locals'  

* koa-views 2.x - ctx.locals
* koa-views 3.x - ctx.state

#### Example: 
```js
// for koa-views 3.x
app.use(KAL({
  path: Path.resolve(__dirname, 'i18n'),
  supported: [{code:'en_US', lang:'English'},{code:'zh_CN', lang:'简体中文'}],
  namespace: 'state'
}, app));
```

### cookieKey {String}


### cookies {Object}
Store the selected language in the cookie. see [koa cookie](http://koajs.com/#ctx-cookies-set-name-value-options-) for more information.
#### Example: 
```js
app.use(KAL({
  path: Path.resolve(__dirname, 'i18n'),
  cookies: {
    domain: 'hello.com',
    maxAge: 365*24*60*60*1000
  }
}, app));
```




### default {String}
Default language
#### Example:
```js
app.use(KAL({
  path: Path.resolve(__dirname, 'i18n'),
  supported: [{code:'en_US', lang:'English'},{code:'zh_CN', lang:'简体中文'}],
  default: 'en_US'
}, app));

```



### set_url {String}
The url to switch current language. default value: `/set_locale`
#### Example:
```js
app.use(KAL({
  path: Path.resolve(__dirname, 'i18n'),
  set_url: '/set_locale'
}, app));

```
Then you can set current language by request url like this '/set_locale?lang=en_US'




## Local Params
The following three params are set to ctx.namespace, default `ctx.locals`. For koa-views 3.x version, you can set namespace to `ctx.state`
- `this.locals._i18n_` {Object}
- `this.locals._i18n_current_` {String}
- `this.locals._i18n_supported_` {Array}

## Debug

Set the `DEBUG` environment variable to `koa-adam-locale` when starting your server.

```bash
$ DEBUG=koa-adam-locale
```

## License

  MIT
