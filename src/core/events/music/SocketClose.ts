import { Listener } from "discord-akairo";
import { Socket } from "lavaclient";

export default class SocketCloseEvent extends Listener {
  public constructor() {
    super("socketClose", {
      emitter: "music",
      event: "socketClose",
    });
  }

  exec({ id, host, port }: Socket, code: number, reason: string) {
    this.client.logger.info(
      `Socket was closed at ${host}:${port} with ID of ${id} with code ${code} and reason ${reason}`
    );
  }
}
