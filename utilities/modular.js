import fs from 'fs';
import path, { resolve } from 'path';
import chalk from 'chalk';

const __dirname = process.cwd();

// This will handle all of the module loading
export class ModularModule {
    constructor() {
        this.isModularModule = true;
        this.class = null;
        this.modularID = null;
    }
    getClass() {
        return this.class;
    }
    classExistCheck() {
        if (this.getClass === null || this.getClass === undefined) {
            throw new Error("[Modular] Class is not defined!");
        }
    }
    async initClass() {
        return new Promise((resolve, reject) => {
            this.classExistCheck();

            let providedClass = this.class;

            let newClass = new providedClass();

            newClass.setModularID(this.modularID);

            this.class = newClass;

            if (this.class.load !== undefined) { this.class.load() };
            if (this.class.load === undefined) {
                resolve(this.class);
            }

            resolve(this.class);
        });
    }
    getModularID() {
        return this.modularID;
    }
    assignModular(id, newClass) {
        this.modularID = id;
        this.class = newClass;
    }
}

export class ModularModuleClass {
    constructor() {
        this.modularID = null;
    }
    getModularID() {
        return this.modularID;
    }
    setModularID(id) {
        this.modularID = id;
    }
    message(msg) {
        console.log(chalk.magenta(`[Modular] ${chalk.bgGray(chalk.red(chalk.bold(chalk.italic("MODULE ") + this.getModularID())))} ${msg}`))
    }
}

export default class Modular {
    constructor() {
        this.modules = {};
        this.moduleCount = 0;
    }
    removeModule(id, debug = false) {
        if (this.modules[id] === undefined) {
            if (debug === true)
                console.log("[Modular] Module does not exist!");
        }
        delete this.modules[id];
        this.moduleCount--;
    }
    addModule(id, module, debug = false) {
        if (this.modules[id] !== undefined) {
            if (debug === true)
                console.log("[Modular] Module already exists!");
        }
        this.modules[id] = module;
        this.moduleCount++;
    }
    getModule(id, debug = false) {
        if (this.modules[id] === undefined) {
            if (debug === true)
                console.log("[Modular] Module does not exist!");
            return null;
        }
        return this.modules[id];
    }
    moduleExists(id) {
        if (this.modules[id] === undefined) {
            return false;
        }
        return true;
    }
    async loadCode(file, debug = false) {
        if (debug === true)
            console.log(`[Modular] Importing ${file}...`);
        let module;
        try {
            module = await import(file);
        } catch (err) {
            if (debug === true)
                console.log(`[Modular] Error importing ${file}, continuing operations. Error:\n${chalk.red(err)}`);
            // forgot to import it from debug.js
            return null;
        }

        return module;
    }
    async loadModules(provided_path, debug = false) {
        // Get full directory path
        const directory = path.resolve(provided_path);
        // Get all items in directory
        const directory_items = fs.readdirSync(directory);
        // Loop through all items in directory and exclude the ones that are directories
        const module_files = [];

        for (let i = 0; i < directory_items.length; i++) {
            if (!fs.statSync(path.join(directory, directory_items[i])).isFile() || !directory_items[i].endsWith('.js')) {
                continue;
            }
            module_files.push(directory_items[i]);
        }

        // Loop through all files and load them
        for (let i = 0; i < module_files.length; i++) {
            let module = await this.loadCode(path.join(directory, module_files[i]), debug);

            if (module !== null) {
                let mod = module;
                if (mod.Module === undefined) {
                    if (debug === true)
                        console.log("[Modular] Module is not defined in module file!");
                    continue;
                }
                if (mod.Module instanceof ModularModule === false || mod.Module.isModularModule === undefined || mod.Module.isModularModule !== true) {
                    if (debug === true)
                        console.log("[Modular] Module is not a ModularModule!");
                    continue;
                }
                if (mod.Module.getModularID() === null || mod.Module.getModularID() === undefined) {
                    if (debug === true)
                        console.log("[Modular] Module ID is not defined!");
                    continue;
                }
                if (this.modules[mod.Module.getModularID()] !== undefined) {
                    if (debug === true)
                        console.log("[Modular] Module ID already exists!");
                    continue;
                }
                if (typeof mod.Module.getModularID() !== 'string') {
                    if (debug === true)
                        console.log("[Modular] Module ID must be a string!");
                    continue;
                }
                if (mod.Module.getModularID().toLowerCase() !== mod.Module.getModularID()) {
                    if (debug === true)
                        console.log("[Modular] Module ID must be lowercase!");
                    continue;
                }
                if (mod.Module.getModularID().includes(' ')) {
                    if (debug === true)
                        console.log("[Modular] Module ID must not contain spaces!");
                    continue;
                }
                if (mod.Module.getModularID().includes('-')) {
                    if (debug === true)
                        console.log("[Modular] Module ID must not contain dashes!");
                    continue;
                }
                // Check if id starts with a number
                if (!isNaN(mod.Module.getModularID().charAt(0))) {
                    if (debug === true)
                        console.log("[Modular] Module ID must not start with a number!");
                    continue;
                }

                this.modules[mod.Module.getModularID()] = mod.Module;
                this.moduleCount++;
                if (debug === true)
                    console.log(`[Modular] Added module <${mod.Module.getModularID()}> from ${module_files[i]} [${this.moduleCount}/${module_files.length}]`);

                if (this.modules[mod.Module.getModularID()].getClass() === null || this.modules[mod.Module.getModularID()].getClass() === undefined) {
                    if (debug === true)
                        console.log(`[Modular] Class is not defined for module <${mod.Module.getModularID()}> from ${module_files[i]} [${this.moduleCount}/${module_files.length}], removing from modules list.`);
                    this.removeModule(mod.Module.getModularID());
                    continue;
                }
                // you can just to instanceof ModularModule
                if (!(this.modules[mod.Module.getModularID()].getClass() instanceof ModularModuleClass)) {
                    await this.modules[mod.Module.getModularID()].initClass();
                    if (debug === true)
                        console.log(`[Modular] Initialized class for module <${mod.Module.getModularID()}> from ${module_files[i]} [${this.moduleCount}/${module_files.length}]`);
                } else {
                    if (debug === true)
                        console.log(`[Modular] Class is already defined for module <${mod.Module.getModularID()}> from ${module_files[i]} [${this.moduleCount}/${module_files.length}]`);
                }
            }
        }
    }
}