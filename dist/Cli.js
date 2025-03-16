"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const broadcastServer_1 = require("./broadcastServer");
const Client_1 = require("./Client");
const DEFAULT_PORT = 7000;
const DEFAULT_URL = `ws://localhost:${DEFAULT_PORT}`;
const program = new commander_1.Command();
program
    .name('broadcast-server')
    .description(`A simple broadcast server and client implementation`)
    .version('1.0.0');
program
    .command('start')
    .description('Start the broadcast server')
    .option('-p, --port <number>', 'port to listen on', DEFAULT_PORT.toString())
    .action((option) => {
    const port = parseInt(option.port);
    new broadcastServer_1.BroadcastServer(port);
});
program
    .command('connect')
    .description('Connect to the broadcast server for other users')
    .option('-u, --url <string>', 'server URL to connect to', DEFAULT_URL)
    .action((option) => {
    new Client_1.BroadCastClient(option.url);
});
program.parse();
