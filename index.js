
const loadPairs = require('./tradePairs');
const startWatch = require('./tradeWatch');

let pairs = [];

(async ()=>{
    try{
        pairs = await loadPairs();
        //console.log(pairs.pop());
        startWatch(pairs);
    }
    catch(e){
        console.log(e);
        console.log('Failed to get the pairs');
    }
})();
