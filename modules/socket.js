import { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';
import { ModularModule, ModularModuleClass } from '../utilities/modular.js';

let Module = new ModularModule();

class Socket extends ModularModuleClass {
    constructor() {
        super();
    }
    on(event, callback) {
        this.ee.on(event, callback);
    }
    emit(event, data) {
        this.ee.emit(event, data);
    }
    load() {
        this.message("Module has been initialized!");
    }
    start(options) {
        this.options = {
            port: 8080
        };
        Object.assign(this.options, options);
        this.ee = new EventEmitter();
        this.socket = new WebSocketServer({ port: this.options.port ? this.options.port : 8080 });
        this.socket.on('connection', (clientSocket) => {
            this.emit('socket_client_open', {socket: clientSocket});
            clientSocket.on('message', (message) => {
                this.emit('socket_client_message', {socket: clientSocket, message: message});
            });
            clientSocket.on('close', () => {
                this.emit('socket_client_close', {socket: clientSocket});
            });
            clientSocket.on('error', (error) => {
                this.emit('socket_client_error', {socket: clientSocket, error: error});
            });
        });

        this.socket.on('error', (error) => {
            this.emit('socket_error', {error: error});
        });

        this.socket.on('close', () => {
            this.emit('socket_close');
        });

        this.socket.on('listening', () => {
            this.emit('socket_open');
        });
    }
}

Module.assignModular('socket', Socket);

export {
    Socket,
    Module
}