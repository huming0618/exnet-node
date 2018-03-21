import { EventEmitter } from 'events';

const url = require('url');
const WebSocket = require('ws');
const HttpsProxyAgent = require('https-proxy-agent');

// HTTP/HTTPS proxy to connect to
const proxy = process.env.HTTP_PROXY;

const endpoint = "wss://real.okex.com:10441/websocket";
const parsed = url.parse(endpoint);

const PING_MSG = appUtil.PING_MSG;
const PONG_MSG = appUtil.PONG_MSG;

const instance = ()=>{
    this.endpoint = null;
}

instance.prototype = Object.create(EventEmitter.prototype);

instance.prototype.sendMessage = (msg)=>{

}

instance.prototype.checkHeartBeat = ()=>{
    const ts = Date.now();
    this.endpoint.send(PING_MSG);
    this.pingTime = ts;
}



module.exports = instance;