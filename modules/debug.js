import chalk from 'chalk';
import { ModularModule, ModularModuleClass } from '../utilities/modular.js';

let Module = new ModularModule();

class Debugger extends ModularModuleClass {
    constructor() {
        super();
        this.debug = false;
    }
    load() {
        this.message("Module has been initialized!");
    }
    // I want to get the name of the module from the ModularModule
    log(type, message, force) {
        if(message === undefined && type !== undefined) {
            message = type;
            type = "info";
        }
        if(force === undefined || force === null) {
            force = false;
        }
        switch(type) {
            case "info":
                if (this.debug || force) {
                    console.log(chalk.blue("[Debug] " + message));
                }
                break;
            case "warn":
                if (this.debug || force) {
                    console.log(chalk.yellow("[Debug] " + message));
                }
                break;
            case "error":
                if (this.debug || force) {
                    console.log(chalk.red("[Debug] " + message));
                }
                break;
            case "success":
                if (this.debug || force) {
                    console.log(chalk.green("[Debug] " + message));
                }
                break;
            default:
                if (this.debug || force) {
                    console.log(chalk.blue("[Debug] " + type + " " + message));
                }
                break;
        }
    }
    logDebugState() {
        if (this.debug) {
            this.log('info', `Debugging is ${chalk.green("on")}!`, true);
        } else {
            this.log('info', `Debugging is ${chalk.red("off")}!`, true);
        }
    }
    setDebugState(state) {
        this.debug = state;
        this.logDebugState();
    }
    getDebugState() {
        return this.debug;
    }
}

Module.assignModular("debugger", Debugger);

export {
    Debugger,
    Module
}