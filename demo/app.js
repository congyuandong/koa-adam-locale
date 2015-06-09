var Path = require('path');
var View = require('koa-views')
var KAL = require('../index');
var Session = require('koa-session');
var koa = require('koa');
var app = koa();

app.keys = ['some secret hurr'];
app.use(Session(app));

/* i18n */
app.use(KAL({
	path: Path.resolve(__dirname, 'i18n'),
  supported: [{code:'en-us', lang:'English'},{code:'zh-cn', lang:'简体中文'}]
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