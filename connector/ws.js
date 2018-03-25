
const setTimeout = require('timers').setTimeout;
const setInterval = require('timers').setInterval;
const EventEmitter = require('events').EventEmitter;
const url = require('url');

const WebSocket = require('ws');
const appUtil = require('../util');


// HTTP/HTTPS proxy to connect to
const proxy = process.env.HTTP_PROXY;



const PING_MSG = appUtil.PING_MSG;
const PONG_MSG = appUtil.PONG_MSG;

const EVENT_HEARTBEAT = "EVENT_HEARTBEAT";
const EVENT_HEARTBEAT_TIMEOUT = "EVENT_HEARTBEAT_TIMEOUT";

const defaultOptions = {
    agent: null,
    hearbeatInterval: 10000,
    heartbeatTimeout: 300
}

class WSConnector extends EventEmitter{

    constructor(wsURL, options){
        super();
        this.options = Object.assign({} || options, defaultOptions);
        
        this.endpoint = new WebSocket(wsURL, options);

        this.endpoint.on('message', (data, flags) => {
            console.log('data', data);
            if (data === PONG_MSG){
                console.log('pong');
                const duration = Date.now() - this.sendPingTS;
                this.emit(EVENT_HEARTBEAT, duration);
                this.latestPong = PONG_MSG;
            }
            else {
                this.latestReply = data;
            }
        });

        this.endpoint.on('open', ()=>{
            console.log('OPEN');
            setInterval(this.keepAlive.bind(this), options.hearbeatInterval);
        })
        
    }

    sendMessage(msg, waitReplyTimeout){
        this.latestReply = null;
        this.endpoint.send(msg);
        return new Promise((resolve, reject)=>{
            if (!waitReplyTimeout) {
                resolve();
            }
            else {
                setTimeout(()=>{
                    if (this.latestReply){
                        resolve(this.latestReply);
                    }
                    else {
                        reject();
                    }
                }, waitReplyTimeout);
            }
        });
    }
    
    keepAlive(){
        this.latestPong = null;
        this.sendPingTS = Date.now();
        this.endpoint.send(PING_MSG);

        setTimeout(()=>{
            const nowTS = Date.now();
            if (this.latestPong){
            }
            else {
                this.emit(EVENT_HEARTBEAT_TIMEOUT);
            }
        }, this.options.heartbeatTimeout);
    }

}

module.exports = WSConnector;