const fs = require('fs');

function saveToFile(data) {
    const newData = JSON.stringify(data) + '\n';
    fs.appendFile('./data/auctions_items.data.json', newData, { flag: 'a' }, (err) => {
        if (err) throw err;
        //console.log('Auction Updated.');
    });
}

function auctionUpdateHandler(data) {
    saveToFile(data);

    
}
exports.auctionUpdateHandler = auctionUpdateHandler;
