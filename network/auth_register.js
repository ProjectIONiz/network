import { NetworkModule } from "../modules/network.js";
import idgen from "../utilities/idgen.js";
import crypto from "crypto";

export default class Module extends NetworkModule {
    constructor() {
        super();
    }
    check(packet) {
        if(packet?.data?.username === undefined || packet?.data?.password === undefined) {
            return false;
        }
        return true;
    }
    async handle(packet) {
        if(this.check(packet)) {
            let newid = idgen();
            if(await this.network.querydb("has", "users", packet.data.username)) {
                packet.client.send(this.network.packet("err_not_fatal", {
                    type: 1,
                    message: "Username already exists",
                    id: packet?.data?.id || null
                }));
                return;
            }

            await this.network.querydb("add", "users", {
                [packet.data.username]: {
                    id: newid,
                    username: packet.data.username,
                    password: crypto.createHash("sha512").update(packet.data.password).digest("hex")
                }
            });
            packet.client.send(this.network.packet("auth_response", {
                id: newid
            }));
        } else {
            packet.client.send(this.network.packet("err_not_fatal", {
                type: 2,
                message: "Not provided: username/password",
                id: packet?.data?.id || null
            }));
            return;
        }
    }
}