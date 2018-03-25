const HttpsProxyAgent = require('https-proxy-agent');
const url = require('url');

const wsConnector = require('../connector/ws');

const endpoint = "wss://real.okex.com:10441/websocket";
const proxy = process.env.HTTP_PROXY;
const options = {};

if (proxy){
    const agent = new HttpsProxyAgent(url.parse(proxy));
    options.agent = agent;
}

const target = new wsConnector(endpoint, options);
