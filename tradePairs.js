const request = require('request');
// https.globalAgent.options.secureProtocol = 'SSLv3_method';

const OK_URL = "https://www.okex.com/v2/spot/markets/currencies";

//const proxy = process.env.HTTP_PROXY;
//HTTP_PROXY=http://127.0.0.1:1087 node tradePairs.js


const load = (callback)=>{
    request(OK_URL, function (error, response, body) {
        if (error){
            callback(error);
        }
        else {
            if (response && response.statusCode){
                if (typeof body === 'string'){
                    const result = JSON.parse(body);
                    callback(null, result.data.map(x=>x.symbol.toLowerCase()))
                }
            }
            else {
                callback(new Error('tradePairs - response error'));
            }
    
        }
    });
}

module.exports = require('util').promisify(load);