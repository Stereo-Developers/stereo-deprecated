import { Listener, Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import ms from "ms";

export default class CooldownEvent extends Listener {
  public constructor() {
    super("cooldown", {
      emitter: "commandHandler",
      event: "cooldown",
    });
  }

  exec(message: Message, cmd: Command, time: number) {
    return message.util.send(
      new MessageEmbed().setColor("#f55e53").setDescription(
        message.translate("bot.events.handler.cooldown", {
          time: ms(time, { long: true }),
        })
      )
    );
  }
}
