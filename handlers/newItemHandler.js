const fs = require('fs');
const balance = require('../utils/balance')
const axios = require('axios');
require('dotenv').config();

const csgoempireApiKey = process.env.API_KEY;

const domain = process.env.DOMAIN

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
    for (const element of favoriteItems) {
        if (element.name === name && element.max_price >= purchase_price) {
            return true;
        }
    }
    return false;
}

async function placeBid(itemId, bidValue) {
    try {
        await axios.post(`https://${domain}/api/v2/trading/deposit/${itemId}/bid`, {
            bid_value: bidValue
        }, {
            headers: {
                Authorization: `Bearer ${csgoempireApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Bid placed successfully:');
        return true;
    } catch (error) {
        console.error('Error placing bid:');
        return false;
    }
}

async function newItemHandler(data) {
    for (const element of data) {
        const favoriteItem = await isFavoriteItemAndGoodPrice(element.market_name, element.purchase_price);
        if (favoriteItem) {
            console.log(`[NEW_ITEM] ${element.market_name} is a favorite item and has a good price ${element.purchase_price}.`);

            if (element.purchase_price <= balance.balance) {
                await placeBid(element.id, element.purchase_price);
            }

        }
    }
}

loadFromFile('./config/favorite_items.data.json');

exports.newItemHandler = newItemHandler;