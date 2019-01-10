const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
const Router = require('koa-router')
const koaBody = require('koa-body')
const koaSend = require('koa-send')
const FileStore = require('../model/file')
const { HAPPY_RECORD } = require('../config/constConfig')
let file = new Router()


// share.get('/',async (ctx,next)=>{
//     await ctx.render('index')
// })

file.get('/file/:id', async (ctx, next) => {
    let { id } = ctx.params
    let file = await FileStore.findById(id)
    if (file.local) {
        ctx.attachment(file.link);
        await koaSend(ctx, file.link, {
            ContentType: file.type
        })
    } else {
        await ctx.response.redirect(file.link);
    }

})

file.use(['/file/upload'], koaBody({ multipart: true })).all(['/file/upload'], async (ctx, next) => {
    if (!(ctx.request.files || ctx.request.body.files)) {
        ctx.request.body.icon = ''
        return await next()
    }

    let { file } = ctx.request.files || ctx.request.body.files
    if (!file || !file.path) {
        return await next()
    }
    // 创建可读流
    const reader = fs.createReadStream(file.path);
    const name = crypto.createHash('md5').update(`${file.name} ${Date.now()}`).digest('hex')
    const filePath = path.join(__dirname, '../store/') + `${name}${file.name}`;
    // 创建可写流
    const upStream = fs.createWriteStream(filePath);
    // 可读流通过管道写入可写流
    reader.pipe(upStream);

    ctx.request.body.link = `/store/${name}${file.name}`
    ctx.request.body.type = file.type
    ctx.request.body.name = file.name
    return await next()
}).all(['/file/upload'], async (ctx, next) => {
    let { link, type, name, category } = ctx.request.body
    let res = await FileStore.save({ link, user: ctx.session.user._id, local: true, type, category, name })
    ctx.body = {
        status: true,
        link: `${HAPPY_RECORD.HOST_URL}/api/file/${res._id}`
    }
})


module.exports = file