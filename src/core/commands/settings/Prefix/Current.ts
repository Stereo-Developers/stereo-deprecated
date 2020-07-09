import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class PrefixCommand extends Command {
  public constructor() {
    super("prefix-current", {
      category: "flag",
    });
  }

  exec(message: Message) {
    return message.util.send(
      new MessageEmbed().setColor("#7289DA").setDescription(
        message.translate("commands.settings.prefix.current", {
          prefixes: message.prefix
            .map((p, i) => `**${i + 1}.** ${p}`)
            .join("\n"),
        })
      )
    );
  }
}
