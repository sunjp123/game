const QcloudSms = require("qcloudsms_js");

// 短信应用SDK AppID
const appid = 1400161072;  // SDK AppID是1400开头

// 短信应用SDK AppKey
const appkey = "369e4bf97f98f735324c4b59bdbb035b";


// 短信模板ID，需要在短信应用中申请
const templateId = 253021;  // NOTE: 这里的模板ID`7839`只是一个示例，真实的模板ID需要在短信控制台中申请
//templateId 7839 对应的内容是"您的验证码是: {1}"
// 签名
const smsSign = "孙建平记录分享";  // NOTE: 这里的签名只是示例，请使用真实的已申请的签名, 签名参数使用的是`签名内容`，而不是`签名ID`

// 实例化QcloudSms
const qcloudsms = QcloudSms(appid, appkey);

const ssender = qcloudsms.SmsSingleSender();

// // 设置请求回调处理, 这里只是演示，用户需要自定义相应处理回调
// function callback(err, res, resData) {
//     if (err) {
//         console.log("err: ", err);
//     } else {
//         console.log("request data: ", res.req);
//         console.log("response data: ", resData);
//     }
// }

module.exports = (phone,params)=>{
    return new Promise((resolve,reject)=>{
        ssender.sendWithParam(86, phone, templateId,
            params, smsSign, "", "", (err, res, resData)=>{
                resolve({err, res, resData})
            });  // 签名参数未提供或者为空时，会使用默认签名发送短信
    })
    
}