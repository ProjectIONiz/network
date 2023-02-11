import Modular from './utilities/modular.js';
import fs from 'fs';

const modular = new Modular();

const __dirname = process.cwd();

await modular.loadModules(__dirname+'/modules');

// requiring our modules
let debug = modular.getModule('debugger').getClass();
let socket = modular.getModule('socket').getClass();
let protocol = modular.getModule('protocol').getClass();
let network = modular.getModule('network').getClass();
let database = modular.getModule('db').getClass();

const config = JSON.parse(fs.readFileSync(__dirname+'/config.json'));

socket.start({port: config?.socket_settings?.port || 8080});

// parse arguments that start with -- or -
let args = process.argv.slice(2);
let options = {};
for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
        let arg = args[i].replace('--', '');
        if (args[i+1] && !args[i+1].startsWith('--')) {
            options[arg] = args[i+1];
            i++;
        } else {
            options[arg] = true;
        }
    } else if (args[i].startsWith('-')) {
        let arg = args[i].replace('-', '');
        if (args[i+1] && !args[i+1].startsWith('-')) {
            options[arg] = args[i+1];
            i++;
        } else {
            options[arg] = true;
        }
    }
}

// check for debug flag
if (options.debug || options.d) {
    debug.setDebugState(true);
}

debug.log('info', 'Hello World!');
socket.on('socket_open', () => {
    debug.log('success', 'Socket has been opened!');
});

socket.on('socket_client_message', (returned) => {
    debug.log('info', `Socket has received a message! Forwarded to protocol.`);
    let packet = protocol.parse(returned);
    if(packet === null) {
        debug.log('warn', `Protocol has returned null upon parsing packet, possible client modification.`);
        if(returned.socket === undefined) {
            debug.log('error', `Protocol has returned null upon parsing packet, possible client modification. Client socket is undefined.`);
            return;
        }
        returned.socket.send(protocol.packet('err_not_fatal', {type: 0, message: 'Protocol has returned null upon parsing packet, possible client modification.', packet: returned.message}));
        return;
    }
    debug.log('info', `Socket received message has been parsed by protocol! Forwarded to network.`);
    network.handle(packet);
});

socket.on('socket_error', () => {
    debug.log('error', 'Socket has encountered an error!');
});

socket.on('socket_close', () => {
    debug.log('error', 'Socket has been closed!');
});

socket.on('socket_client_open', (returned) => {
    let clientSocket = returned.socket;
    debug.log('info', `Socket has received a client!`);
    network.client(clientSocket);
});

socket.on('socket_client_close', (returned) => {
    let clientSocket = returned.socket;
    debug.log('info', `Socket has lost a client!`);
    network.clientClose(clientSocket);
});

network.on('db_query', async (query) => {
    let response = await database.query(query.queryID, query.type, query.name, query.args);
    if (response === null) {
        debug.log('error', `Database has returned null upon query!`);
        return;
    }
    debug.log('info', `Database has returned a response! Forwarded back to network.`);
    network.querydb_response(response);
});