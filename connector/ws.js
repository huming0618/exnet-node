import { setInterval } from 'timers';


const setTimeout = require('timers').setTimeout;
const EventEmitter = require('events').EventEmitter;
const util = require('util');


const url = require('url');
const WebSocket = require('ws');
const HttpsProxyAgent = require('https-proxy-agent');

const appUtil = require('./util');

// HTTP/HTTPS proxy to connect to
const proxy = process.env.HTTP_PROXY;



const PING_MSG = appUtil.PING_MSG;
const PONG_MSG = appUtil.PONG_MSG;

const EVENT_HEARTBEAT = "EVENT_HEARTBEAT";
const EVENT_HEARTBEAT_TIMEOUT = "EVENT_HEARTBEAT_TIMEOUT";

const instance = (wsURL, options)=>{
    //const parsedURL = url.parse(wsURL);
    this.endpoint = new WebSocket(wsURL, options);
    whenReceivedMessage.call(this);
    this.sendMessage = sendMessage.bind(this);

    const keepAlive = keepAlive.bind(this);
    setInterval(keepAlive, options.hearbeatInterval || 10000);
}

util.inherits(instance, EventEmitter);

const sendMessage = (msg, waitReplyTimeout)=>{
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

const whenReceivedMessage = ()=>{
    this.endpoint.on('message', (data, flags) => {
        if (data === PONG_MSG){
            const duration = Date.now() - this.sendPingTS;
            this.emit(EVENT_HEARTBEAT, duration);
            this.latestPong = PONG_MSG;
        }
        else {
            this.latestReply = data;
        }
    });
}

const keepAlive = ()=>{
    this.latestPong = null;
    this.sendPingTS = Date.now();
    this.endpoint.send(PING_MSG);
    this.pingTime = ts;
    setTimeout(()=>{
        const nowTS = Date.now();
        if (this.latestPong){
            this.hearbeat
        }
        else {
            this.emit(EVENT_HEARTBEAT_TIMEOUT);
        }
    }, this.options.heartbeatTimeout || 300);
}

module.exports = instance;