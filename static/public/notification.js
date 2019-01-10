
export default class Notifications {
    constructor({icon = '/public/icon/logo.svg',title='记录快乐',body='记录你遇到的快乐！'}){
        this.icon = icon;
        if(window.Notification){
            //判断当前页面是否被允许发出通知
            const permission = Notification.permission
            if(permission == 'granted'){
                this.showNotify(title,{body})
            }else if(permission == 'default'){
                Notification.requestPermission();
            }
        }
    }
    showNotify(params={}){
        if(Notification.permission!='granted') return false
        const {title='记录快乐',body='记录你遇到的快乐！',icon} = params;
        return new Notification(title,{body,icon:icon || this.icon,renotify:true,tag:Math.random()})
    }
}