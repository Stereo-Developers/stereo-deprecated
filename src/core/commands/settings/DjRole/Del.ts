import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import { confirm } from "../../../../library/functions";

export default class DjRoleCommand extends Command {
  public constructor() {
    super("djrole-del", {
      category: "flag",
    });
  }

  async exec(message: Message) {
    const words = (message.translate("bot.prompts.confirmWords") ?? [
      "yes",
      "no",
    ]) as string[];

    const conf = await confirm(
      message,
      message.translate("commands.settings.djrole.del.prompts.confirm", {
        words: words.map((word) => `\`${word}\``).join(", "),
      })
    );

    if (!conf)
      return message.util.send(
        new MessageEmbed()
          .setColor("#f55e53")
          .setDescription(
            message.translate("commands.settings.djrole.del.prompts.cancelled")
          )
      );

    this.client.db.delete(message.guild.id, "config.djRole");

    return message.util.send(
      new MessageEmbed()
        .setColor("#7289DA")
        .setDescription(
          message.translate("commands.settings.djrole.del.success")
        )
    );
  }
}
