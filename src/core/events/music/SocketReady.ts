import { Listener } from "discord-akairo";
import { Socket } from "lavaclient";

export default class SocketReadyEvent extends Listener {
  public constructor() {
    super("socketReady", {
      emitter: "music",
      event: "socketReady",
    });
  }

  exec({ id, host, port }: Socket) {
    this.client.logger.info(
      `Socket was opened at ${host}:${port} with ID of ${id}`
    );
  }
}
