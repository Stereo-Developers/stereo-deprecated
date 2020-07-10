import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class PrivacyCommand extends Command {
  public constructor() {
    super("privacy", {
      aliases: ["privacy", "privacypolicy"],
      description: (m: Message) =>
        m.translate("commands.info.privacy.description"),
    });
  }

  exec(message: Message) {
    return message.util.send(
      message.translate("commands.info.privacy.response", {
        url: `${config.get("bot.links.github")}/blob/master/PRIVACY-POLICY.md`,
      })
    );
  }
}
