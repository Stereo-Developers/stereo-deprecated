import { Listener } from "discord-akairo";
import { Socket } from "lavaclient";

export default class SocketDisconnectEvent extends Listener {
  public constructor() {
    super("socketDisconnect", {
      emitter: "music",
      event: "socketDisconnect",
    });
  }

  exec({ id, host, port }: Socket, tries: number) {
    this.client.logger.info(
      `Socket was disconnected at ${host}:${port} with ID of ${id} after ${tries} retries.`
    );
  }
}
