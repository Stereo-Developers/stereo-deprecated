import { Listener } from "discord-akairo";

export default class ReadyEvent extends Listener {
  public constructor() {
    super("ready", {
      emitter: "client",
      event: "ready",
    });
  }

  exec() {
    this.client.logger.info(`${this.client.user.tag} is ready to play music!`);

    this.client.user.setActivity(
      `${config.get("bot.prefix")[0]}help | giving people music to listen to`,
      { type: "WATCHING" }
    );
  }
}
