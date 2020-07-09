import { Listener, Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class CommandBlockedEvent extends Listener {
  public constructor() {
    super("commandBlocked", {
      emitter: "commandHandler",
      event: "commandBlocked",
    });
  }

  exec(message: Message, cmd: Command, reason: string) {
    switch (reason) {
      case "guild":
        return message.util.send(
          new MessageEmbed()
            .setColor("#f55e53")
            .setDescription(message.translate("bot.events.handler.guild"))
        );

      case "owner":
        return message.util.send(
          new MessageEmbed()
            .setColor("#f55e53")
            .setDescription(message.translate("bot.events.handler.owner"))
        );

      case "djrole":
        return message.util.send(
          new MessageEmbed()
            .setColor("#f55e53")
            .setDescription(message.translate("bot.events.handler.dj"))
        );
    }
  }
}
