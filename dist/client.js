"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadCastClient = void 0;
const ws_1 = __importDefault(require("ws"));
const readline_1 = __importDefault(require("readline"));
const config_1 = require("./config");
class BroadCastClient {
    constructor(serverUrl) {
        this.ws = null;
        this.username = '';
        this.PROTOCOL = config_1.PROTOCOL;
        this.serverUrl = serverUrl;
        this.rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.init();
    }
    init() {
        this.authenticate();
    }
    authenticate() {
        this.rl.question('Enter your username: ', (username) => {
            if (!username.trim()) {
                console.error('\nUsername cannot be empty');
                this.authenticate();
                return;
            }
            this.username = username.trim();
            this.connectToServer();
        });
    }
    connectToServer() {
        try {
            const options = {
                headers: {
                    'X-Username': this.username
                },
            };
            this.ws = new ws_1.default(this.serverUrl, this.PROTOCOL, options);
            this.ws.on('open', () => {
                console.log('Connected to server');
                this.typing();
            });
            this.ws.on('error', (error) => {
                console.error('\nConnection failed:', error.message);
                this.cleanUp();
            });
            this.ws.on('close', (code, reason) => {
                console.log('\nDisconnected from server:', reason.toString());
                this.cleanUp();
            });
            this.ws.on('message', (data) => {
                try {
                    //Clear the current "Typing:" prompt
                    process.stdout.write('\r'); //Move cursor back to the beginning of the line
                    process.stdout.write(' '.repeat(20)); //clear the line
                    process.stdout.write('\r'); //Move cursor back to the beginning
                    //Display the received message
                    console.log(`${data.toString()}`);
                    //Reprint the "Typing:" prompt
                    this.rl.prompt(true);
                }
                catch (error) {
                    console.error('\nMessage Error:', error);
                }
            });
        }
        catch (error) {
            console.error('Failed to connect:', error);
            process.exit(1);
        }
    }
    typing() {
        if (!this.ws)
            return;
        this.rl.question('Typing: ', (message) => {
            const canBeSent = message.trim().toLowerCase();
            if (canBeSent === 'quit' || canBeSent === "exit") {
                this.rl.close();
                this.ws.close();
                return;
            }
            if (canBeSent) {
                this.ws.send(message);
            }
            this.typing();
        });
    }
    cleanUp() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.rl.close();
        process.exit(0);
    }
}
exports.BroadCastClient = BroadCastClient;
