const util = {};

util.PING_MSG = "{'event':'ping'}";
util.PONG_MSG = '{"event":"pong"}';

util.SYMBOL_USDT = "usdt";
util.SYMBOL_BTC = "btc";
util.SYMBOL_ETH = "eth";

util.getSubscribeMessageForDepth = (target, base)=>{
    return `{'event':'addChannel','channel':'ok_sub_spot_${target}_${base}_depth'}`;
}

util.getSubscribeMessageForTicker = (target, base)=>{
    return `{'event':'addChannel','channel':'ok_sub_spot_${target}_${base}_ticker'}`;
}

util.getSubscribeMessageForDeals = (target, base)=>{
    return `{'event':'addChannel','channel':'ok_sub_spot_${target}_${base}_deals '}`;
}

module.exports = util;