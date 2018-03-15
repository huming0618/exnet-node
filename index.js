
const loadPairs = require('./tradePairs');
const startWatch = require('./tradeWatch');

let pairs = [];

(async ()=>{
    try{
        pairs = await loadPairs();
        //console.log('paris', pairs[0]);
        startWatch(pairs)
    }
    catch(e){
        console.log(e);
        console.log('Failed to get the pairs');
    }

})();
