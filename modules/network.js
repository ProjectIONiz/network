import { ModularModule, ModularModuleClass } from "../utilities/modular.js";
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import chalk from 'chalk';

let __dirname = path.resolve();

let Module = new ModularModule();

class NetworkModule {
    constructor() {
        this.network = Module.getClass();
    }
}

class Network extends ModularModuleClass {
    constructor() {
        super();
        this.ee = new EventEmitter();
        this.clients = {};
        this.modules = {};
        this.awaitingDBQueries = {};
    }
    async loadCode(path) {
        let module;
        try {
            module = await import(path);
        }
        catch(e) {
            throw new Error("Failed to load module: " + path);
            return null;
        }
        return module;
    }
    async loadNetworkModules() {
        // Module path is ../network/
        let modulePath = __dirname + "/network/";

        let files = fs.readdirSync(modulePath);
        // filter the files for .js
        files = files.filter((file) => {
            return file.endsWith(".js");
        });

        // the network directory is where we handle the packets.
        // we will load all the files in the directory and then we will load them into the network.
        for(let i = 0; i < files.length; i++) {
            let file = files[i];
            let module = await this.loadCode(modulePath + file);
            if(module !== null) {
                this.modules[file.split('.')[0]] = module;
            }
        }
    }
    async load() {
        await this.loadNetworkModules();
        this.message("Module has been initialized!");
    }
    handle(packet) {
        if(this.modules[packet.type] !== undefined) {
            let module = this.modules[packet.type];
            if(module !== undefined) {
                let instance = new module.default();
                if(instance instanceof NetworkModule) {
                    try {
                        instance.handle(packet);
                    } catch (e) {
                        console.log(chalk.red("[Network] An error occurred in a network module!\n"+e));
                    }
                }
            }
        }
    }
    on(event, callback) {
        this.ee.on(event, callback);
    }
    emit(event, data) {
        this.ee.emit(event, data);
    }
    packet(type, data) {
        // We make if/else check for data
        if(data === undefined) {
            return JSON.stringify({
                type: type
            });
        } else {
            return JSON.stringify({
                type: type,
                data: data
            });
        }
    }
    client(socket) {
        // we send a request to the client to authenticate
        socket.send(this.packet('auth_request'));
    }
    clientClose(socket) {
        // if the client is authenticated, we remove them from the list of authenticated clients
        if(socket.auth !== undefined && socket.auth.id !== undefined) {
            this.removeAuthedClient(socket.auth.id);
        }
    }
    addAuthedClient(id, socket) {
        // add the client to the list of authenticated clients
        this.clients[id] = socket;
    }
    removeAuthedClient(id) {
        // remove the client from the list of authenticated clients
        delete this.clients[id];
    }
    getClient(id) {
        // get the client from the list of authenticated clients
        return this.clients[id];
    }
    querydb_response(query) {
        let queryID = query.id;
        let response = query.response;
        if(this.awaitingDBQueries[queryID] === undefined) {
            return;
        }
        this.awaitingDBQueries[queryID].resolve(response);
        delete this.awaitingDBQueries[queryID];
    }
    generateDBID() {
        // generate a long random hex string using crypto
        return crypto.randomBytes(128).toString('hex');
    }
    async querydb(type, name, args) {
        // we send a request to the database to query
        let id = this.generateDBID();
        this.awaitingDBQueries[id] = {
            type: type,
            name: name,
            args: args
        }
        this.emit('db_query', {
            queryID: id,
            type: type,
            name: name,
            args: args
        });
        return new Promise((resolve, reject) => {
            this.awaitingDBQueries[id].resolve = resolve;
            this.awaitingDBQueries[id].reject = reject;
        });
    }
}

Module.assignModular('network', Network);

export {
    Network,
    NetworkModule,
    Module
}