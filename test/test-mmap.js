const mmap = require("mmap-io");
const fs = require("fs");

someFile = "./foo.bar"

fd = fs.openSync(someFile, "r");
fdW = fs.openSync(someFile, "r+");

//size = fs.statSync(someFile).size
size = 9
rxProt = mmap.PROT_READ | mmap.PROT_EXECUTE
priv = mmap.MAP_SHARED

console.log('size', size, fdW);
// fs.writeSync(fdW, 'contents to append')
// fs.closeSync(fd)

buffer = mmap.map(size, rxProt, priv, fd);
buffer2 = mmap.map(size, mmap.PROT_READ, priv, fd, 0, mmap.MADV_SEQUENTIAL);
wBuffer = mmap.map(size, mmap.PROT_WRITE, priv, fdW);

console.log(wBuffer)
mmap.advise(wBuffer, mmap.MADV_RANDOM);

mmap.sync(wBuffer);
mmap.sync(wBuffer, true);
mmap.sync(wBuffer, 0, size);
mmap.sync(wBuffer, 0, size, true);
mmap.sync(wBuffer, 0, size, true, false);

// setInterval(()=>{
    const content = [parseInt(Math.random() * 10),
    parseInt(Math.random() * 10),
    parseInt(Math.random() * 10),
    parseInt(Math.random() * 10),
    parseInt(Math.random() * 10),
    parseInt(Math.random() * 10),
    parseInt(Math.random() * 10),
    parseInt(Math.random() * 10),
    parseInt(Math.random() * 10),
    parseInt(Math.random() * 10),
    parseInt(Math.random() * 10),
    parseInt(Math.random() * 10)].join('')
    console.log(content);
    wBuffer.write(content, 'utf-8');
// }, 200)

console.log('end');

