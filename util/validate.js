const EMAIL_VALIDATE = value => /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(value)
const PHONE_VALIDATE = value => /^[1][3-9][0-9]{9}$/.test(value)
const PASSWORD_VALIDATE = value => /^.*(?=.{7,})(?=.*\d)(?=.*[a-z])(?=.*[!@#$%^&*? ]).*$/.test(value)
const URL_VALIDATE = value => /^[a-zA-z]+\:\/\/(?:\w+(?:-\w+)*)(?:\.(?:\w+(?:-\w+)*))*(?:\:\d+)?(?:\?\S*)?/.test(value)

module.exports = class Validate {
    static isEmail(value){
        return EMAIL_VALIDATE(value)
    }
    static isPhone(value){
        return PHONE_VALIDATE(value)
    }
    static isPassword(value){
        return PASSWORD_VALIDATE(value)
    }
    static isUrl(value){
        return URL_VALIDATE(value)
    }
    static isArray(value){
        return Object.prototype.toString.call(value) == "[object Array]"
    }
    static isNotEmpty(value){
        return value != ''
    }
    static isLength(value){
        return value && value.length == (this.length || 1)
    }
    static isMatchReg(value,regexp){
        return (this.regexp || regexp || /.*/).test(value)
    }
    static isCaptcha(value){
        return /^[\w]{4}$/.test(value)
    }
    static isPhoneCaptcha(value){
        return /^[\d]{6}$/.test(value)
    }
}