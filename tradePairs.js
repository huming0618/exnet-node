const request = require('request');
const fs = require('fs');

// https.globalAgent.options.secureProtocol = 'SSLv3_method';

//104.25.20.25
const OK_URL = "https://www.okex.com/v2/spot/markets/currencies";

//const proxy = process.env.HTTP_PROXY;
//HTTP_PROXY=http://127.0.0.1:1087 node tradePairs.js


const load = (callback)=>{
    if (fs.existsSync('only_symbol.list')){
        let list = fs.readFileSync('only_symbol.list').toString().split("\n")
        callback(null, new Set(list))
        return;
    }
    else {
        request(OK_URL, function (error, response, body) {
            if (error){
                callback(error);
            }
            else {
                if (response && response.statusCode){
                    if (typeof body === 'string'){
                        const result = JSON.parse(body);
                        let list = result.data.map(x=>x.symbol.toLowerCase());
                        if (fs.existsSync('more_symbol.list')){
                            list = list.concat(fs.readFileSync('more_symbol.list').toString().split("\n"));
                        }
                        callback(null, new Set(list))
                    }
                }
                else {
                    callback(new Error('tradePairs - response error'));
                }
        
            }
        });
    }

}

module.exports = require('util').promisify(load);