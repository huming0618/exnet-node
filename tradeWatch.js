const url = require('url');
const WebSocket = require('ws');
const HttpsProxyAgent = require('https-proxy-agent');

const appUtil = require('./util');
const wsConnector = require('./connector/ws');

// HTTP/HTTPS proxy to connect to
const proxy = process.env.HTTP_PROXY;

//47.90.109.236
const endpoint = "wss://real.okex.com:10441/websocket";
//const parsed = url.parse(endpoint);

const PING_MSG = appUtil.PING_MSG;
const PONG_MSG = appUtil.PONG_MSG;

const options = {};

if (proxy){
    const agent = new HttpsProxyAgent(url.parse(proxy));
    options.agent = agent;
}

const fillSubscribeList = (list, target)=>{

    list.push(appUtil.getSubscribeMessageForDepth(target, appUtil.SYMBOL_USDT));
    list.push(appUtil.getSubscribeMessageForTicker(target, appUtil.SYMBOL_USDT));
    list.push(appUtil.getSubscribeMessageForDeals(target, appUtil.SYMBOL_USDT));
    
    list.push(appUtil.getSubscribeMessageForDepth(target, appUtil.SYMBOL_BTC));
    list.push(appUtil.getSubscribeMessageForTicker(target, appUtil.SYMBOL_BTC));
    list.push(appUtil.getSubscribeMessageForDeals(target, appUtil.SYMBOL_BTC));
    
    list.push(appUtil.getSubscribeMessageForDepth(target, appUtil.SYMBOL_ETH));
    list.push(appUtil.getSubscribeMessageForTicker(target, appUtil.SYMBOL_ETH));
    list.push(appUtil.getSubscribeMessageForDeals(target, appUtil.SYMBOL_ETH));
}

const startWatchList = (list)=>{
    const MONITOR_LIST = [];

    const ws = new wsConnector(endpoint, options);
    ws.connect();
    
    list.forEach(item=>{
        fillSubscribeList(MONITOR_LIST, item);
    });

    ws.on('open', ()=>{
        ws.sendBatchMessages(MONITOR_LIST);
    });

    ws.on('data', (data)=>{
        console.log(data);
    });

    ws.on('error', ()=>{
        ws.reconnect();
    });

    ws.on('wss.close', ()=>{
        ws.reconnect();
    });

    ws.on('heartbeatTimeout', ()=>{
        // console.log('heartbeat.timeout');
        // ws.connect();
    })
}

module.exports = startWatchList;
