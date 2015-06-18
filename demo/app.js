var Path = require('path');
var View = require('koa-views')
var KAL = require('../index');
var koa = require('koa');
var app = koa();

/* i18n */
app.use(KAL({
	path: Path.resolve(__dirname, 'i18n'),
  cookieKey: 'current_lang',
  cookies: {
    maxAge: 365*24*60*60*1000
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

app.listen(process.argv[2], function() {
  console.log('server started on', process.argv[2]);
})