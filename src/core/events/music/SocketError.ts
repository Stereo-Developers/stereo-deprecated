import { Listener } from "discord-akairo";
import { Socket } from "lavaclient";

export default class SocketErrorEvent extends Listener {
  public constructor() {
    super("socketError", {
      emitter: "music",
      event: "socketError",
    });
  }

  exec({ id, host, port }: Socket, error: Error) {
    this.client.logger.error(
      `Socket errored at ${host}:${port} with ID of ${id}:\n\n${error.stack}`
    );
  }
}
