const url = require('url');
const WebSocket = require('ws');
const HttpsProxyAgent = require('https-proxy-agent');

// HTTP/HTTPS proxy to connect to
const proxy = process.env.HTTP_PROXY;

const endpoint = "wss://real.okex.com:10441/websocket";
const parsed = url.parse(endpoint);


const options = {};

if (proxy){
    const agent = new HttpsProxyAgent(url.parse(proxy));
    options.agent = agent;
}

const socket = new WebSocket(endpoint, options);

socket.on('open', function () {
    console.log('"open" event!');
    socket.send("{'event':'addChannel','channel':'ok_sub_spot_trx_usdt_depth'}");
    socket.send("{'event':'addChannel','channel':'ok_sub_spot_trx_btc_depth'}");
    socket.send("{'event':'addChannel','channel':'ok_sub_spot_trx_eth_depth'}");
});

socket.on('message', function (data, flags) {
    console.log((new Date()).toDateString());
    console.log(data);
    console.log('......................');
});