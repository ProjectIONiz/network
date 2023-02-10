import { ModularModule, ModularModuleClass } from "../utilities/modular.js";
import fs from 'fs';
import path from 'path';

let __dirname = path.resolve();

let Module = new ModularModule();

class Database extends ModularModuleClass {
    constructor() {
        super();
        this.db = null;
        this.db_location = path.resolve(__dirname, 'db.json');
        this.loadDatabase();
    }
    loadDatabase() {
        if(!fs.existsSync(this.db_location)) {
            fs.writeFileSync(this.db_location, JSON.stringify({}));
        }
        this.db = JSON.parse(fs.readFileSync(this.db_location, 'utf-8'));
    }
    update() {
        fs.writeFileSync(this.db_location, JSON.stringify(this.db));
    }
    load() {
        this.message("Module has been initialized!");
    }
    set(name, data) {
        this.db[name] = data;
        this.update();
        return true;
    }
    add(name, data) {
        if(!this.has(name)) {
            this.db[name] = data;
        }
        this.db[name] = {
            ...this.db[name],
            ...data
        }
        this.update();
        return true;
    }
    has(name, data) {
        if(data !== undefined) {
            if(this.db[name] === undefined) return false;
            if(this.db[name][data] === undefined) return false;
            return true;
        }

        return this.db[name] !== undefined;
    }
    delete(name) {
        if(!this.has(name)) return false;
        delete this.db[name];
        this.update();
        return true;
    }
    get(name, data) {
        if(data !== undefined) {
            if(!this.has(name, data)) return null;
            return this.db[name][data];
        } else {
            if(!this.has(name)) return null;
            return this.db[name];
        }
    }
    query(id, type, name, data) {
        switch(type) {
            case 'set':
                return {id: id, response: this.set(name, data)};
                break;
            case 'has':
                return {id: id, response: this.has(name, data)};
                break;
            case 'delete':
                return {id: id, response: this.delete(name)};
                break;
            case 'get':
                return {id: id, response: this.get(name, data)};
                break;
            case 'add':
                return {id: id, response: this.add(name, data)};
                break;
        }
        return null;
    }
}

Module.assignModular('db', Database);

export {
    Database,
    Module
}