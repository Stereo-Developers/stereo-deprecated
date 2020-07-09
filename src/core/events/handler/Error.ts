import { Listener, Command } from "discord-akairo";
import { Message, MessageEmbed, TextChannel } from "discord.js";

export default class ErrorEvent extends Listener {
  public constructor() {
    super("error", {
      emitter: "commandHandler",
      event: "error",
    });
  }

  exec(error: Error, message: Message, cmd: Command) {
    this.client.logger.error(`Error on command ${cmd}:\n${error.stack}`);

    message.util.send(
      new MessageEmbed().setColor("#f55e53").setDescription(
        message.translate("bot.events.handler.error", {
          discord: config.get("bot.links.discord"),
          error,
        })
      )
    );

    const channel = this.client.channels.cache.get(
      config.get("bot.channels.errors")
    ) as TextChannel;
    if (!channel) return;

    channel.send(
      new MessageEmbed()
        .setColor("#f55e53")
        .setDescription(
          `Awh fuck, there's an error on command ${cmd}\n\`\`\`js\n${error}\`\`\``
        )
    );
  }
}
