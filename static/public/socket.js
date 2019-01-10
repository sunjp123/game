import socketClient from 'socket.io-client';

export default class SokcetServer {
    constructor({events}){
        this.client = new socketClient()
        if(!this.client){
            return null
        }
        if(events){
            this.addEvent(events)
        }
    }
    addEvent(events){
        try{
            Object.entries(events).map(event =>{
                this.client.on.apply(this.client,event)
            })
        }catch(e){
            throw 'add events error'
        }
        
    }

}