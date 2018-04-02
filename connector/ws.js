
const setTimeout = require('timers').setTimeout;
const setInterval = require('timers').setInterval;
const clearInterval = require('timers').clearInterval;
const EventEmitter = require('events').EventEmitter;
const url = require('url');

const WebSocket = require('ws');
const appUtil = require('../util');

const log4js = require('log4js');



const logger = log4js.getLogger('WSS');
log4js.configure({
    appenders: { 'WSS': { type: 'file', filename: 'log/wss-debug.log' } },
    categories: { default: { appenders: ['WSS'], level: 'debug' } }
  });

logger.level = 'debug';


// HTTP/HTTPS proxy to connect to
const proxy = process.env.HTTP_PROXY;



const PING_MSG = appUtil.PING_MSG;
const PONG_MSG = appUtil.PONG_MSG;

const EVENT_HEARTBEAT = "heartbeat";
const EVENT_HEARTBEAT_TIMEOUT = "heartbeatTimeout";

const defaultOptions = {
    agent: null,
    hearbeatInterval: 15000,
    heartbeatTimeout: 300,
    reconnectTimeout: 5000
}

class WSConnector extends EventEmitter{

    constructor(wsURL, theOptions){
        logger.debug('OPENING');
        super();
        this.wsURL = wsURL;
        this.options = Object.assign({} || theOptions, defaultOptions);
        this.reconnectTimer = null;
        this.keepAliveTimer = null;
    }

    isConnecting(){
        return this.endpoint.readyState === WebSocket.CONNECTING;
    }

    isOpened(){
        return this.endpoint.readyState === WebSocket.OPEN;
    }

    isClosing(){
        return this.endpoint.readyState === WebSocket.CLOSING;
    }

    isClosed(){
        return this.endpoint.readyState === WebSocket.CLOSED;
    }

    reconnect(){
        clearInterval(this.keepAliveTimer);
        logger.debug('TO_RECONNECT', this.endpoint.readyState);
        if (WebSocket.CLOSED !== this.endpoint.readyState){
            console.log('try to terminate');
            this.endpoint.terminate();
        }
        this.reconnectTimer = setInterval(()=>{
            logger.debug('TO_RECONNECT');
            this.connect();
            console.log('Re-Connected', );
        }, this.options.reconnectTimeout);
    }

    connect(){
        const options = this.options;
        this.endpoint = new WebSocket(this.wsURL, options);

        this.endpoint.on('message', (data, flags) => {
            if (data === PONG_MSG){
                const duration = Date.now() - this.sendPingTS;
                this.emit(EVENT_HEARTBEAT, duration);
                logger.debug('RECV_PONG_WITH_DELAY', duration);
                this.latestPong = PONG_MSG;
            }
            else {
                this.emit('data', data);
                this.latestReply = data;
            }
        });

        this.endpoint.on('open', ()=>{
            logger.debug('OPENED');
            console.log('OPENED', this.endpoint.readyState);
            if (this.reconnectTimer !== null){
                clearInterval(this.reconnectTimer);
                console.log('clear reconnectTimer');
                this.reconnectTimer = null;
            }
            this.emit('open');
            
            this.keepAliveTimer = setInterval(this.keepAlive.bind(this), options.hearbeatInterval);
        })

        this.endpoint.on('close', (e)=>{
            logger.debug('CLOSED');
            clearInterval(this.keepAliveTimer);
            this.emit('close');
        });

        this.endpoint.on('error', (e)=>{
            logger.debug('ERROR', e);
            this.emit('wss.error', e);
        });
    }

    sendBatchMessages(msgList){
        msgList.forEach(x=>{
            this.endpoint.send(x);
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
                        logger.debug('REPLY_TIMEOUT', `Expected: ${waitReplyTimeout}ms`);
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
            if (this.latestPong === null){
                this.emit(EVENT_HEARTBEAT_TIMEOUT);
                logger.debug('HEARTBEAT_TIMEOUT');
                //this.endpoint.close(1000);
                clearInterval(this.keepAliveTimer);
                this.reconnect();
            }
        }, this.options.heartbeatTimeout);
    }
}

module.exports = WSConnector;
