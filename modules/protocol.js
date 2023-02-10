import fs from 'fs';
import path from 'path';
import { ModularModule, ModularModuleClass } from '../utilities/modular.js';

const __dirname = path.resolve();

let Module = new ModularModule();

class Protocol extends ModularModuleClass {
    constructor() {
        super();
    }
    load() {
        this.message("Module has been initialized!");
    }
    parse(returned) {
        // first, attempt to JSON parse the returned data message
        try {
            let message = JSON.parse(returned.message);
            returned = {
                type: message.type,
                data: message.data,
                socket: returned.socket
            }
        }
        catch(e) {
            // if it fails, return null
            return null;
        }

        // we have now parsed it, we can now check if it has a type.
        if(returned.type === undefined) {
            // if it doesn't, return null
            return null;
        }

        // check for the socket
        if(returned.socket === undefined) {
            // if it doesn't, return null
            return null;
        }

        // if it does, return the data

        return {
            type: returned.type,
            data: returned.data,
            client: returned.socket
        }
    }
    packet(name, args) {
        return JSON.stringify({
            type: name,
            data: args
        });
    }
}

Module.assignModular('protocol', Protocol);

export {
    Protocol,
    Module
}