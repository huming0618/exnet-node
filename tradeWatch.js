const url = require('url');
const pg = require('pg');
const HttpsProxyAgent = require('https-proxy-agent');

const appUtil = require('./util');
const wsConnector = require('./connector/ws');
const createTableSQL = require('./createtable.sql');

// HTTP/HTTPS proxy to connect to
const proxy = process.env.HTTP_PROXY;

//47.90.109.236
const endpoint = "wss://real.okex.com:10441/websocket";
//const parsed = url.parse(endpoint);

const PING_MSG = appUtil.PING_MSG;
const PONG_MSG = appUtil.PONG_MSG;

const options = {};

const DB_USER = 'postgres';
const DB_PWD = 'nhn!23nhn';
const DB_SERVER = 'localhost:5432/liuda';

const pgConfig = `pg://${DB_USER}:${DB_PWD}@${DB_SERVER}`;
const pgClient = new pg.Client(pgConfig);
const TABLE_NAME = createTableSQL.table;

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

const startWatchList = async (list)=>{
    const MONITOR_LIST = [];
    await pgClient.connect();

    const ws = new wsConnector(endpoint, options);
    const result = await pgClient.query(createTableSQL.sql);
    console.log('DB Init');

    ws.connect();
    
    list.forEach(item=>{
        fillSubscribeList(MONITOR_LIST, item);
    });

    ws.on('open', ()=>{
        ws.sendBatchMessages(MONITOR_LIST);
    });

    ws.on('data', (data)=>{
        //console.log(data);
        const insertQuery = `INSERT INTO ${TABLE_NAME}(detail,ts) VALUES('${data}', NOW())`;
        pgClient.query(insertQuery);
    });

    ws.on('wss.error', ()=>{
        ws.reconnect();
    });

    ws.on('close', ()=>{
        ws.reconnect();
    });

    ws.on('heartbeatTimeout', ()=>{
        // console.log('heartbeat.timeout');
        // ws.connect();
    })
}

module.exports = startWatchList;
