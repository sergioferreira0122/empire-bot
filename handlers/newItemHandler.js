const fs = require('fs');

let favoriteItems = []

async function saveToFile(data) {
    const newData = JSON.stringify(data) + '\n';
    fs.appendFile('./data/new_items.data.json', newData, { flag: 'a' }, (err) => {
        if (err) throw err;
        //console.log('New Item.');
    });
}

function loadFromFile(path) {
    try {
        const fileData = fs.readFileSync(path, 'utf8');

        favoriteItems = JSON.parse(fileData);
    } catch (error) {
        console.error('Error loading favorite items from ./config/favorite_items.data.json', error);
    }
}

async function isFavoriteItemAndGoodPrice(name, purchase_price) {
    for (const element of favoriteItems) {
        if (element.name === name && element.max_price >= purchase_price) {
            return true;
        }
    }
    return false;
}

async function newItemHandler(data) {
    saveToFile(data);
    
    for (const element of data) {
        const favoriteItem = await isFavoriteItemAndGoodPrice(element.market_name, element.purchase_price);
        if (favoriteItem) {
            console.log(`[NEW_ITEM] ${element.market_name} is a favorite item and has a good price ${element.purchase_price}.`);
        }
    }
}

loadFromFile('./config/favorite_items.data.json');

exports.newItemHandler = newItemHandler;