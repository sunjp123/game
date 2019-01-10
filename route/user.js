
const fs = require('fs')
const path = require('path')
const Router = require('koa-router')
const koaBody = require('koa-body')
const svgCaptcha = require('svg-captcha')
const { JSEncrypt } = require('jsencrypt')
const User = require('../model/user')
const Message = require('../model/message')
const validate = require('../util/validate')
const sendCaptcha = require('../bin/sms')
const privateKey = fs.readFileSync('./rsa_1024_priv.pem').toString()
const redis = require('../bin/redis')
let userRouter = new Router()


userRouter.all('/user/captcha', async (ctx, next) => {
    svgCaptcha.options = {
        width: 40,
        height: 40
    }
    const captcha = svgCaptcha.create({
        ignoreChars: '0o1il',
        width: 70,
        height: 30,
        fontSize:36,
        color: false 
    })
    ctx.session.captcha =  captcha.text
    ctx.type = 'svg'
    return ctx.body = captcha.data
})

userRouter.all('/user/send',async (ctx, next) => {
    let { phone , captcha='' } = ctx.request.body;
    let redisKey = await redis.get('captcha-'+phone)
    if(redisKey.value!=null){
        return ctx.body = {
            status: false,
            type:'SEND_REPEAT',
            msg:'短信已发送'
        }
    }
    if(typeof captcha == 'string' && ctx.session.captcha.toUpperCase() == captcha.toUpperCase()){
        let phoneCaptcha = (Math.random()*1000000).toString().replace('.','').substr(0,6),exCaptcha = '000000'
        let captchaCode = phoneCaptcha+exCaptcha.substr(0,6-phoneCaptcha.length)
        let ret = await sendCaptcha(phone,[captchaCode,1])
        if(!ret.err && ret.resData.result==0){
            redis.set('captcha-'+phone,sendCaptcha,60)
            return ctx.body = {
                status: true,
                type:'SEND_SUCCESS',
                msg:ret.resData
            }
        }
        return ctx.body = {
            status: true,
            type:'SEND_ERROR',
            msg:ret.resData
        }
        
    }else{
        return ctx.body = {
            status: false,
            type:'CAPTCHA_ERROR',
            msg:'验证码错误'
        }
    }
})

userRouter.all('/user/login', async (ctx, next) => {
    let { contact, password } = ctx.request.body, condition = {};

    if (!contact || !password) {
        return ctx.body = {
            status: false
        }
    }

    let decrypt = new JSEncrypt();
    decrypt.setPrivateKey(privateKey);
    password = decrypt.decrypt(password);
    condition = { password: password }

    if (validate.isPhone(contact)) {
        condition = { ...condition, phone: contact }
    } else {
        condition = { ...condition, nickname: contact }
    }
    let res = await User.find(condition, { password: 0 })

    if (!res || res.length <= 0) {
        return ctx.body = {
            status: false
        }
    } else {
        ctx.session.user = res[0]
        return ctx.body = {
            status: true
        }
    }
})

userRouter.all('/user/logout', async (ctx, next) => {
    ctx.session.user = ''
    return ctx.body = {
        status: true
    }
})

userRouter.use(['/user/register', '/user/modify'], koaBody({ multipart: true })).all(['/user/modify'], async (ctx, next) => {
    if (!(ctx.request.files || ctx.request.body.files)) {
        ctx.request.body.avator = ''
        return await next()
    }

    let { avator } = ctx.request.files || ctx.request.body.files
    if (!avator || !avator.path) {
        ctx.request.body.avator = ''
        return await next()
    }
    // 创建可读流
    const reader = fs.createReadStream(avator.path);
    let filePath = path.join(__dirname, '../static/avator/') + `${avator.name}`;
    // 创建可写流
    const upStream = fs.createWriteStream(filePath);
    // 可读流通过管道写入可写流
    reader.pipe(upStream);

    ctx.request.body.avator = `/avator/${avator.name}`

    return await next()
}).all('/user/register', async (ctx, next) => {
    let { name, nickname, contact, password, avator , phoneCaptcha} = ctx.request.body, condition = {}, res = '', isEmail = false;
    let redisKey = await redis.get('captcha-'+phone)
    if(phoneCaptcha!=redisKey.value){
        return ctx.body = {
            status: false,
            type: 'CAPTCHA_ERROR'
        }
    }
    if (!contact || !password || !name || !nickname) {
        return ctx.body = {
            status: false,
            type: 'EMPTY'
        }
    }
    condition = { nickname }
    res = await User.find(condition)
    if (res && res.length > 0) {
        return ctx.body = {
            status: false,
            type: 'NICKNAME_EXIST'
        }
    }

    if (validate.isEmail(contact)) {
        isEmail = true
        condition = { email: contact }
        res = await User.find(condition)
        if (res && res.length > 0) {
            return ctx.body = {
                status: false,
                type: 'EMAIL_EXIST'
            }
        }
    } else if (validate.isPhone(contact)) {
        condition = { phone: contact }
        res = await User.find(condition)
        if (res && res.length > 0) {
            return ctx.body = {
                status: false,
                type: 'PHONE_EXIST'
            }
        }
    } else {
        return ctx.body = {
            status: false,
            type: 'CONTACT'
        }
    }


    let decrypt = new JSEncrypt();
    decrypt.setPrivateKey(privateKey);
    password = decrypt.decrypt(password);

    res = await User.save({ name, nickname, password, avator, email: isEmail ? contact : '', phone: !isEmail ? contact : '' })
    if (!res) {
        return ctx.body = {
            status: false,
            type: 'SAVE_ERROR'
        }
    } else {
        ctx.session.user = res
        return ctx.body = {
            status: true,
        }
    }
})

userRouter.all('/user/modify', async (ctx, next) => {
    let { _id, name, nickname, contact, password, avator } = ctx.request.body, condition = {}, res = '', isEmail = false;

    if (!contact || !password || !name || !nickname) {
        return ctx.body = {
            status: false,
            type: 'EMPTY'
        }
    }
    condition = { nickname }
    res = await User.find(condition)
    if (res && res.length > 0) {
        return ctx.body = {
            status: false,
            type: 'NICKNAME_EXIST'
        }
    }

    if (validate.isEmail(contact)) {
        isEmail = true
        condition = { email: contact }
        res = await User.find(condition)
        if (res && res.length > 0) {
            return ctx.body = {
                status: false,
                type: 'EMAIL_EXIST'
            }
        }
    } else if (validate.isPhone(contact)) {
        condition = { phone: contact }
        res = await User.find(condition)
        if (res && res.length > 0) {
            return ctx.body = {
                status: false,
                type: 'PHONE_EXIST'
            }
        }
    } else {
        return ctx.body = {
            status: false,
            type: 'CONTACT'
        }
    }


    let decrypt = new JSEncrypt();
    decrypt.setPrivateKey(privateKey);
    password = decrypt.decrypt(password);
    res = await User.find({ _id })

    if (!res || res.length <= 0) {
        return ctx.body = {
            status: false,
            type: 'MODIFY_ERROR'
        }
    } else if (res && res.length > 0) {
        let user = Object.assign(res[0], {
            name,
            nickname,
            password,
            avator: avator ? avator : res[0].avator,
            email: isEmail ? contact : '', phone: !isEmail ? contact : ''
        })
        await user.save();
        ctx.session.user = res[0]
        return ctx.body = {
            status: true,
        }
    }
})

userRouter.all('/user/message', async (ctx, next) => {
    const _id = ctx.session.user._id,
        messages = await Message.find({$nor:[{user:_id}]}),
        res = await User.findUserMessage(_id, messages.map(message => message._id));
    let ret = []
    if (res) {
        ret = messages.filter(message => {
            return res.messages.every(msg =>{
                return msg.toString() != message._id.toString()
            })
        })
    } else {
        ret = messages
    }

    return ctx.body = {
        status: true,
        res: ret
    }
})
userRouter.all('/user/read/:message', async (ctx, next) => {
    const _id = ctx.session.user._id, { message } = ctx.params;
    const messages = await Message.find({_id:message})
    if(messages && messages.length>0){
        let user = await User.findById(_id)
        user.messages.push(message)
        await user.save()
    }
    return ctx.body = {
        status: true
    }
})
module.exports = userRouter