
const Koa = require('koa')
const Router = require('koa-router')
const Static = require('koa-static')
const helmet = require('koa-helmet')
const Ejs = require('koa-ejs')
const Views = require('koa-views')
const Logger = require('koa-logger')
const path = require('path')
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const socketServer = require('socket.io');
const crypto = require('crypto');

// const game = require('./route/game');

const CONFIG = require('./config/sessionConfig')


const app = new Koa()

const server = require('http').createServer(app.callback())

const io = require('./bin/socket')(socketServer(server))


Ejs(app,{
    root:path.join(__dirname,'./static'),
    layout:'',
    viewExt: 'html',
    cache: true,
    debug: false
})

const router = new Router()

app.keys = ['sun game secret'];

app.use(helmet())

app.use(session(CONFIG, app));

app.use(bodyParser())

app.use(Views(path.join(__dirname, './static'), {
	  extension: 'html'
}))

router.get(['/game/:name/:number'],async (ctx,next)=>{
    const { name , number} = ctx.params;
    if(!ctx.session.vid){
        const hash = crypto.createHmac('sha256', 'sun game secret')
                   .update(''+(new Date()).getTime())
                   .digest('hex');
        ctx.session.vid = hash
    } 
	ctx.render('index',{__user__:JSON.stringify(ctx.session.vid),__number__:number})	
    // await next()
})

// router.use('/api',game.routes(),game.allowedMethods())

app.use(router.routes())

app.use(Static(
    path.join( __dirname, './static'),{
        maxAge:365*3600*24,
        gzip:true
    }
))

app.use(Logger())

server.listen('3004')
