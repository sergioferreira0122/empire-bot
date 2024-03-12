const axios = require('axios');
require('dotenv').config();

const csgoempireApiKey = process.env.API_KEY;

const domain = process.env.DOMAIN

axios.defaults.headers.common['Authorization'] = `Bearer ${csgoempireApiKey}`;

let balance = 0;

async function startUpBalance() {
    try {
        const userData = (await axios.get(`https://${domain}/api/v2/metadata/socket`)).data;

        balance = userData.user.balance;

        exports.balance = balance;
    } catch (error) {
        console.error("Error fetching socket data:", error);
    }
}

async function updateBalance() {
    setInterval(async () => {
        try {
            const userData = (await axios.get(`https://${domain}/api/v2/metadata/socket`)).data;

            balance = userData.user.balance;
            console.log("Balance updated:", balance);

            exports.balance = balance;
        } catch (error) {
            console.error("Error fetching socket data:", error);
        }
    }, 60000); //1 minute
}

startUpBalance();

updateBalance();

exports.balance = balance;