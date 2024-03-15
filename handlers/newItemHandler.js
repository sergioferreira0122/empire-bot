const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const csgoempireApiKey = process.env.API_KEY;

let favoriteItems = []

let biddedItems = []

function loadFromFile(path) {
    try {
        const fileData = fs.readFileSync(path, 'utf8');

        favoriteItems = JSON.parse(fileData);
    } catch (error) {
        console.error('Error loading favorite items from ./config/favorite_items.data.json', error);
    }
}

async function isFavoriteItemAndGoodPrice(name, purchase_price) {
    loadFromFile('./config/favorite_items.data.json');

    for (const element of favoriteItems) {
        if (element.name === name && element.max_price >= purchase_price) {
            return element;
        }
    }
    return null;
}

async function placeBid(itemId, bidValue) {
    try {
        await axios.post(`https://csgoempire.com/api/v2/trading/deposit/${itemId}/bid`, {
            bid_value: bidValue
        }, {
            headers: {
                Authorization: `Bearer ${csgoempireApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Bid placed successfully');
        return true;
    } catch (error) {
        console.error('Error placing bid');
        return false;
    }
}

async function saveBidToFile(data) {
    const newData = JSON.stringify(data) + '\n';
    fs.appendFile('./bids/items_bids.data.json', newData, { flag: 'a' }, (err) => {
        if (err) throw err;
    });
}

async function newItemHandler(data) {
    for (const element of data) {
        const favoriteItem = await isFavoriteItemAndGoodPrice(element.market_name, element.purchase_price);
        if (favoriteItem != null) {
            console.log(`[NEW_ITEM] ${element.market_name} is a favorite item and has a good price ${element.purchase_price}.`);

            const statusBid = await placeBid(element.id, element.purchase_price);

            if (statusBid) {
                let biddedItem = {id: element.id, max_price: favoriteItem.max_price}
                biddedItems.push(biddedItem);

                saveBidToFile({description: element.market_name, id: element.id, value: element.purchase_price})
            }
            
        }
    }
}

module.exports = {
    newItemHandler,
    biddedItems
};