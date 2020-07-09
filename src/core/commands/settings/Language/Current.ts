import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class LanguageCommand extends Command {
  public constructor() {
    super("language-current", {
      category: "flag",
    });
  }

  exec(message: Message) {
    return message.util.send(
      new MessageEmbed().setColor("#7289DA").setDescription(
        message.translate("commands.settings.language.current", {
          language: message.language,
        })
      )
    );
  }
}
