"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastServer = void 0;
const ws_1 = __importDefault(require("ws"));
const http_1 = require("http");
const config_1 = require("./config");
class BroadcastServer {
    constructor(port) {
        this.clients = new Map();
        this.PROTOCOL = config_1.PROTOCOL;
        this.hs = (0, http_1.createServer)();
        this.wss = new ws_1.default.Server({ noServer: true });
        //Bind methods to preserve 'this' context
        this.onHttpUpgrade = this.onHttpUpgrade.bind(this);
        this.onSocketError = this.onSocketError.bind(this);
        this.authenticate = this.authenticate.bind(this);
        this.init(port);
    }
    init(port) {
        this.hs.on('upgrade', this.onHttpUpgrade);
        this.onWebSocketConnection();
        this.hs.listen(port, () => {
            console.log(`Broadcast Server is running on port ${port}`);
        });
    }
    onHttpUpgrade(req, socket, header) {
        socket.on('error', this.onSocketError);
        this.authenticate(req, (err, client) => {
            if (err || !client) {
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy();
                return;
            }
            socket.removeListener('error', this.onSocketError);
            this.wss.handleUpgrade(req, socket, header, (ws) => {
                this.wss.emit("connection", ws, req, client);
            });
        });
    }
    onSocketError(error) {
        console.log(`Socket Error: `, error.message);
    }
    authenticate(req, callback) {
        const protocols = req.headers['sec-websocket-protocol'];
        const username = req.headers['x-username'];
        if (!protocols || !protocols.split(',').map(p => p.trim()).includes(this.PROTOCOL)) {
            callback(new Error('Invalid protocol'));
            return;
        }
        if (!username || typeof username !== 'string' || username.trim() === '') {
            callback(new Error("Username is required"));
            return;
        }
        let candidateUsername = username.trim();
        const foundInClient = Array.from(this.clients.values())
            .some((name) => name.toLowerCase() === candidateUsername.toLowerCase());
        if (foundInClient) {
            callback(new Error('Username already taken'));
            return;
        }
        callback(null, { username: candidateUsername });
    }
    onWebSocketConnection() {
        this.wss.on('connection', (ws, req, client) => {
            const username = client.username;
            this.clients.set(ws, username);
            console.log(`${username} has joined the chat`);
            console.log(this.onlineUsers());
            this.broadcast({
                type: 'system',
                payload: this.onlineUsers()
            });
            const findClient = () => {
                var _a;
                return (_a = Array.from(this.clients.entries())
                    .find(([client]) => client === ws)) === null || _a === void 0 ? void 0 : _a[1];
            };
            ws.on('message', (message) => {
                const found = findClient();
                if (found) {
                    console.log(`${found}: ${message.toString()}`);
                    this.broadcast({
                        type: 'message',
                        payload: message.toString(),
                        username: found
                    }, ws);
                }
            });
            ws.on('close', () => {
                const username = findClient();
                if (username) {
                    console.log(`${username} has left the chat`);
                    this.broadcast({
                        type: 'system',
                        payload: this.onlineUsers()
                    });
                    this.deleteClient(ws);
                }
            });
            ws.on('error', (err) => {
                console.log("Client Error: ", err.message);
                this.deleteClient(ws);
            });
        });
    }
    broadcast(message, sender) {
        const toBroadcast = message.type === 'system'
            ? `System: ${message.payload}`
            : `${message.username}: ${message.payload}`;
        this.clients.forEach((name, client) => {
            if (client !== sender && client.readyState === ws_1.default.OPEN) {
                client.send(toBroadcast);
            }
        });
    }
    onlineUsers() {
        return `Current online users: ${this.clients.size}`;
    }
    deleteClient(ws) {
        this.clients.delete(ws);
        console.log(this.onlineUsers());
    }
}
exports.BroadcastServer = BroadcastServer;
