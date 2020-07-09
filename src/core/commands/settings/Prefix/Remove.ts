import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import { confirm } from "../../../../library/functions";

export default class PrefixCommand extends Command {
  public constructor() {
    super("prefix-del", {
      category: "flag",
      args: [
        {
          id: "prefix",
          match: "content",
          type: (msg, str) => {
            if (!str) return null;

            str.replace(/`/g, "").toLowerCase();

            if (str.length > 12 || str.length < 1) return null;

            return !msg.prefix.includes(str.toLowerCase()) ? null : str;
          },
          prompt: {
            start: (m: Message) =>
              m.translate("commands.settings.prefix.remove.prompts.start"),
            retry: (m: Message) =>
              m.translate("commands.settings.prefix.remove.prompts.retry"),
          },
        },
      ],
    });
  }

  async exec(message: Message, { prefix }: { prefix: string }) {
    const words = (message.translate("bot.prompts.confirmWords") ?? [
      "yes",
      "no",
    ]) as string[];

    const conf = await confirm(
      message,
      message.translate("commands.settings.prefix.remove.prompts.confirm", {
        words: words.map((word) => `\`${word}\``).join(", "),
      })
    );

    if (!conf)
      return message.util.send(
        new MessageEmbed()
          .setColor("#f55e53")
          .setDescription(
            message.translate(
              "commands.settings.prefix.remove.prompts.cancelled"
            )
          )
      );

    message.prefix.splice(message.prefix.indexOf(prefix), 1);

    return message.util.send(
      new MessageEmbed().setColor("#7289DA").setDescription(
        message.translate("commands.settings.prefix.remove.success", {
          prefix,
        })
      )
    );
  }
}
