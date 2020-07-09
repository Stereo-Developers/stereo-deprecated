import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class LanguageCommand extends Command {
  public constructor() {
    super("language-langs", {
      category: "flag",
    });
  }

  exec(message: Message) {
    return message.util.send(
      new MessageEmbed().setColor("#7289DA").setDescription(
        message.translate("commands.settings.language.languages", {
          langs: [...this.client.languages.languages.keys()]
            .filter((lang) => !["en-GB"].includes(lang))
            .map((lang, index) => `**${index + 1}.** ${lang}`)
            .join(",\n"),
        })
      )
    );
  }
}
