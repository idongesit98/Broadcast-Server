import { Command } from "commander";
import { BroadcastServer } from "./broadcastServer";
import { BroadCastClient } from "./client";

const DEFAULT_PORT = 7000;
const DEFAULT_URL = `ws://localhost:${DEFAULT_PORT}`;
const program = new Command();

program
    .name('broadcast-server')
    .description(`A simple broadcast server and client implementation`)
    .version('1.0.0');

program
    .command('start')
    .description('Start the broadcast server')
    .option('-p, --port <number>', 'port to listen on', DEFAULT_PORT.toString())  
    .action((option) => {
        const port = parseInt(option.port)
        new BroadcastServer(port);
    }); 

program
    .command('connect')
    .description('Connect to the broadcast serer')

    .option('-u, --url <string>', 'server URL to connect to', DEFAULT_URL)
    .action((option) => {
        new BroadCastClient(option.url);
    });

program.parse();
export {};
