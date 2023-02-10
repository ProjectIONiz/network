import { NetworkModule } from "../modules/network.js";
import crypto from "crypto";

export default class Module extends NetworkModule {
    constructor() {
        super();
    }
    async handle(packet) {
        if(packet.client.auth === undefined) {
            if(packet?.data?.username === undefined || packet?.data?.password === undefined) {
                if(packet?.data?.token === undefined) {
                    packet.client.send(this.network.packet("err_not_fatal", {
                        type: 2,
                        message: "Not provided: username/password",
                        id: packet?.data?.id || null
                    }));
                } else {
                    let userTokens = await this.network.querydb("get", "tokens");
                    let userTokenEntry = Object.keys(userTokens).find((key) => userTokens[key] === packet.data.token);
                    if(userTokenEntry === null || userTokenEntry === undefined) {
                        packet.client.send(this.network.packet("err_not_fatal", {
                            type: 5,
                            message: "Invalid token",
                            query_id: packet?.data?.query_id || null
                        }));
                        return;
                    }
                    // find the username of the user using the id (userTokenEntry)

                    let users = await this.network.querydb("get", "users");
                    let user = Object.keys(users).find((key) => users[key].id === userTokenEntry);

                    packet.client.auth = {
                        id: user.id,
                        token: packet.data.token
                    };
                    packet.client.send(this.network.packet("auth_response", {
                        id: user.id,
                        token: packet.data.token,
                        type: 0,
                        message: "Successfully authenticated",
                        query_id: packet?.data?.query_id || null
                    }));
                    this.network.addAuthedClient(user.id, packet.client);
                }
                return;
            }
            let user = await this.network.querydb("get", "users", packet.data.username);
            if(user === null || user === undefined) {
                packet.client.send(this.network.packet("err_not_fatal", {
                    type: 3,
                    message: "Username does not exist",
                    id: packet?.data?.id || null
                }));
                return;
            }
            if(user.password !== crypto.createHash('sha512').update(packet.data.password).digest('hex')) {
                packet.client.send(this.network.packet("err_not_fatal", {
                    type: 4,
                    message: "Password is incorrect",
                    id: packet?.data?.id || null
                }));
                return;
            }
            let token;
            if(await this.network.querydb("has", "tokens", user.id)) {
                token = await this.network.querydb("get", "tokens", user.id);
            } else {
                token = crypto.randomBytes(64).toString('hex');
                await this.network.querydb("add", "tokens", {
                    [user.id]: token
                });
            }

            packet.client.auth = {
                id: user.id,
                token: token
            };
            packet.client.send(this.network.packet("auth_response", {
                id: user.id,
                token: token,
                type: 0,
                message: "Successfully authenticated"
            }));
            this.network.addAuthedClient(user.id, packet.client);
        } else {
            packet.client.send(this.network.packet("auth_response", {
                id: packet.client.auth.id,
                token: packet.client.auth.token,
                type: 1,
                message: "Already authenticated"
            }));
        }
    }
} 