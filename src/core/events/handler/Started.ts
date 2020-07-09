import { Listener, Command } from "discord-akairo";
import { Message } from "discord.js";

export default class CommandStartedListener extends Listener {
  public constructor() {
    super("commandStarted", {
      emitter: "commandHandler",
      event: "commandStarted",
    });
  }

  public async exec(message: Message, cmd: Command, args: any) {
    this.client.logger.info(
      `${cmd.id} was started in ${
        message.guild
          ? `${message.guild.name} | (${message.guild.id})`
          : `${message.author.username} | (DMS)`
      } by: ${message.author.tag} (${message.author.id}) ${
        Object.keys(args).length
          ? `with arguments ${Object.values(args).join(", ")}`
          : ""
      }`
    );
  }
}
