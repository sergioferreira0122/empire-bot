const fs = require('fs');
const axios = require('axios');
const { biddedItems } = require('../handlers/newItemHandler');
require('dotenv').config();

const csgoempireApiKey = process.env.API_KEY;

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
        console.error('Error placing bid:')
        console.error(error.response.data.message);
        return false;
    }
}

async function saveBidToFile(data) {
    const newData = JSON.stringify(data) + '\n';
    fs.appendFile('./bids/items_bids.data.json', newData, { flag: 'a' }, (err) => {
        if (err) throw err;
    });
}

async function calculateNextBid(value) {
    const percentageValue = value * 0.01

    const percentageValueRounded = Math.round(percentageValue)

    const valueWithPercentage = value + percentageValueRounded

    if (value === valueWithPercentage) {
        return valueWithPercentage + 1
    }

    return valueWithPercentage
}

async function auctionUpdateHandler(data) {
    for (const element of data) {
        for (const biddedItem of biddedItems) {
            if (element.id === biddedItem.id && element.auction_highest_bid <= biddedItem.max_price) {
                console.log(`[AUCTION_UPDATE] ${biddedItem.description} is a favorite item and has a good price ${element.auction_highest_bid}.`);
    
                const newValue = await calculateNextBid(element.auction_highest_bid);

                const statusBid = await placeBid(element.id, newValue);
    
                if (statusBid) {
                    saveBidToFile({description: biddedItem.description, id: element.id, value: newValue})
                }
            }
        }
        
    }
}

exports.auctionUpdateHandler = auctionUpdateHandler;