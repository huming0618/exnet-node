const url = require('url');
const WebSocket = require('ws');
const HttpsProxyAgent = require('https-proxy-agent');

const appUtil = require('./util');
const loadPairs = require('./tradePairs');

// HTTP/HTTPS proxy to connect to
const proxy = process.env.HTTP_PROXY;

const endpoint = "wss://real.okex.com:10441/websocket";
const parsed = url.parse(endpoint);

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
    const socket = new WebSocket(endpoint, options);

    list.forEach(item=>{
        fillSubscribeList(MONITOR_LIST, item);
    });

    socket.on('open', () => {
        console.log('"open" event!');
        
        MONITOR_LIST.forEach(x=>{
            socket.send(x);
        })
    
        setInterval(()=>{
            socket.send(PING_MSG);
        },600)
    });
    
    socket.on('message', (data, flags) => {
        if (data === PONG_MSG){
    
        }
        else {
            //console.log((new Date()).toDateString());
            console.log(data);
            //console.log('......................');
        }
    });
}

module.exports = startWatchList;
