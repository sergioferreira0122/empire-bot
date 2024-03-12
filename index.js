const io = require('socket.io-client');
const axios = require('axios');
const { newItemHandler } = require('./handlers/newItemHandler');
const { auctionUpdateHandler } = require('./handlers/auctionUpdateHandler');

let balance = 0;

// Replace "YOUR API KEY HERE" with your API key
const csgoempireApiKey = "8b2fe79ff197c42faeec259edb0baf0c";

// Replace domain to '.gg' if '.com' is blocked
const domain = "csgoempire.com"

const socketEndpoint = `wss://trade.${domain}/trade`;

// Set the authorization header for all axios requests to the CSGOEmpire API Key
axios.defaults.headers.common['Authorization'] = `Bearer ${csgoempireApiKey}`;

// Function for connecting to the web socket
async function initSocket() {

    console.log("Connecting to websocket...");

    try {
        // Get the user data from the socket
        const userData = (await axios.get(`https://${domain}/api/v2/metadata/socket`)).data;

        // Initalize socket connection
        const socket = io(
            socketEndpoint,
            {
                transports: ["websocket"],
                path: "/s/",
                secure: true,
                rejectUnauthorized: false,
                reconnect: true,
                extraHeaders: { 'User-agent': `${userData.user.id} API Bot` } //this lets the server know that this is a bot
            }
        );

        socket.on('connect', async () => {

            // Log when connected
            console.log(`Connected to websocket`);

            // Handle the Init event
            socket.on('init', (data) => {
                if (data && data.authenticated) {
                    console.log(`Successfully authenticated as ${data.name}`);
                    
                    // Emit the default filters to ensure we receive events
                    socket.emit('filters', {
                        price_max: 99999999
                    });
                    
                } else {
                    // When the server asks for it, emit the data we got earlier to the socket to identify this client as the user
                    socket.emit('identify', {
                        uid: userData.user.id,
                        model: userData.user,
                        authorizationToken: userData.socket_token,
                        signature: userData.socket_signature
                    });
                }
            })

            // Listen for the following event to be emitted by the socket after we've identified the user
            //socket.on('timesync', (data) => console.log(`Timesync: ${JSON.stringify(data)}`));
            socket.on('new_item', (data) => newItemHandler(data));
            //socket.on('updated_item', (data) => updatedItemHandler(data));
            socket.on('auction_update', (data) => auctionUpdateHandler(data));
            //socket.on('deleted_item', (data) => console.log(`deleted_item: ${JSON.stringify(data)}`));
            //socket.on('trade_status', (data) => console.log(`trade_status: ${JSON.stringify(data)}`));

            socket.on("disconnect", (reason) => console.log(`Socket disconnected: ${reason}`));
        });

        // Listen for the following event to be emitted by the socket in error cases
        socket.on("close", (reason) => console.log(`Socket closed: ${reason}`));
        socket.on('error', (data) => console.log(`WS Error: ${data}`));
        socket.on('connect_error', (data) => console.log(`Connect Error: ${data}`));
    } catch (e) {
        console.log(`Error while initializing the Socket. Error: ${e}`);
    }
};

async function updateBalance() {
    setInterval(async () => {
        try {
            const userData = (await axios.get(`https://${domain}/api/v2/metadata/socket`)).data;

            balance = userData.user.balance;

            console.log("Balance updated:", balance);
        } catch (error) {
            console.error("Error fetching socket data:", error);
        }
    }, 60000); //1 minute
}

updateBalance();

initSocket();