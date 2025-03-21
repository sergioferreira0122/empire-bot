const io = require('socket.io-client');
const axios = require('axios');
const { newItemHandler } = require('./handlers/newItemHandler');
const { auctionUpdateHandler } = require('./handlers/auctionUpdateHandler');
require('dotenv').config();

const csgoempireApiKey = process.env.API_KEY;

const domain = process.env.DOMAIN

const socketEndpoint = `wss://trade.${domain}/trade`;

axios.defaults.headers.common['Authorization'] = `Bearer ${csgoempireApiKey}`;

async function initSocket() {

    console.log("Connecting to websocket...");

    try {
        const userData = (await axios.get(`https://${domain}/api/v2/metadata/socket`)).data;

        const socket = io(
            socketEndpoint,
            {
                transports: ["websocket"],
                path: "/s/",
                secure: true,
                rejectUnauthorized: false,
                reconnect: true,
                extraHeaders: { 'User-agent': `${userData.user.id} API Bot` }
            }
        );

        socket.on('connect', async () => {

            console.log(`Connected to websocket`);

            socket.on('init', (data) => {
                if (data && data.authenticated) {
                    console.log(`Successfully authenticated as ${data.name}`);
                    
                    socket.emit('filters', {
                        price_max: 99999999
                    });
                    
                } else {
                    socket.emit('identify', {
                        uid: userData.user.id,
                        model: userData.user,
                        authorizationToken: userData.socket_token,
                        signature: userData.socket_signature
                    });
                }
            })

            socket.on('new_item', (data) => newItemHandler(data));
            socket.on('auction_update', (data) => auctionUpdateHandler(data));

            socket.on("disconnect", (reason) => console.log(`Socket disconnected: ${reason}`));
        });

        socket.on("close", (reason) => console.log(`Socket closed: ${reason}`));
        socket.on('error', (data) => console.log(`WS Error: ${data}`));
        socket.on('connect_error', (data) => console.log(`Connect Error: ${data}`));
    } catch (e) {
        console.log(`Error while initializing the Socket. Error: ${e}`);
    }
};

initSocket();