import { NetworkModule } from "../modules/network.js";

export default class Module extends NetworkModule {
    constructor() {
        super();
    }
    handle(packet) {
        this.network.querydb(packet.data.type, packet.data.name, packet.data.data).then((response) => {
            packet.client.send(this.network.packet("querydb_response", {
                id: packet.data.id,
                response: response
            }));
        });
    }
}