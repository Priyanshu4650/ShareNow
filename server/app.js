const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const http = require("http");
const requestIp = require('request-ip');
const os = require('os');

const app = express();
app.use(express.json());
app.use(cors());
app.use(requestIp.mw());

const PORT = process.env.PORT || 3000;

// Get local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (!iface.internal && iface.family === 'IPv4') {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const LOCAL_IP = getLocalIP();
console.log(`Server local IP: ${LOCAL_IP}`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store shared text for different networks
const networkSharedText = new Map();

// Helper function to get network identifier from IP
function getNetworkId(req) {
    // Get the actual client IP from various headers
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const remoteAddress = req.connection.remoteAddress;
    const socketRemoteAddress = req.socket.remoteAddress;
    
    let clientIp = forwardedFor ? forwardedFor.split(',')[0] : 
                   realIp ? realIp :
                   remoteAddress ? remoteAddress :
                   socketRemoteAddress;

    // Remove IPv6 prefix if present
    clientIp = clientIp.replace(/^::ffff:/, '');
    
    // For development/testing, treat localhost and local IP as same network
    if (clientIp === '127.0.0.1' || clientIp === 'localhost' || clientIp === LOCAL_IP) {
        clientIp = LOCAL_IP;
    }
    
    // Extract the first three octets of the IP address
    const networkId = clientIp.split('.').slice(0, 3).join('.');
    
    console.log({
        headers: req.headers,
        forwardedFor,
        realIp,
        remoteAddress,
        socketRemoteAddress,
        clientIp,
        networkId
    });
    
    return networkId;
}

// Add a route to get server info
app.get('/server-info', (req, res) => {
    const networkId = getNetworkId(req);
    res.json({ 
        networkId,
        localIP: LOCAL_IP,
        clientIP: req.clientIp,
        port: PORT
    });
});

wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection");
    
    const networkId = getNetworkId(req);
    console.log('Connection from network:', networkId);
    
    if (!networkSharedText.has(networkId)) {
        networkSharedText.set(networkId, "");
    }

    // Send initial state
    ws.send(JSON.stringify({ 
        type: "init", 
        text: networkSharedText.get(networkId),
        networkId: networkId
    }));

    ws.on("message", (message) => {
        const data = JSON.parse(message);
        
        if(data.type === "save") {
            networkSharedText.set(networkId, data.text);
            console.log(`Saving text for network ${networkId}:`, data.text);
            
            // Notify other clients about the update
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN && client.networkId === networkId) {
                    client.send(JSON.stringify({ 
                        type: "notification",
                        notification: "New text available. Click update to see changes."
                    }));
                }
            });

            // Send success message to sender
            ws.send(JSON.stringify({
                type: "save",
                text: data.text,
                notification: "Text saved successfully!"
            }));
        } else if(data.type === "getLatest") {
            // Send latest text to requesting client
            ws.send(JSON.stringify({
                type: "latestText",
                text: networkSharedText.get(networkId)
            }));
        }
    });

    ws.networkId = networkId;

    ws.on("close", () => {
        console.log("User disconnected from network:", networkId);
    });
});

// Error handling
wss.on('error', (error) => {
    console.error('WebSocket Server Error:', error);
});

server.listen(PORT, '0.0.0.0', () => { 
    console.log(`Server is running on:`);
    console.log(`- Local: http://localhost:${PORT}`);
    console.log(`- Network: http://${LOCAL_IP}:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server Error:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
