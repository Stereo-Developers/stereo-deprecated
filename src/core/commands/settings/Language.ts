import { Command, Flag } from "discord-akairo";
import { Message } from "discord.js";

export default class LanguageCommand extends Command {
  public constructor() {
    super("language", {
      aliases: ["language", "lang"],
      description: (m: Message) =>
        m.translate("commands.settings.language.description"),
      channel: "guild",
      userPermissions: ["SEND_MESSAGES", "MANAGE_MESSAGES"],
    });
  }

  public *args() {
    const method = yield {
      type: [
        ["language-set", "set"],
        ["language-del", "del", "delete", "rm", "remove"],
        ["language-current", "current"],
        ["language-langs", "languages", "langs"],
      ],
      default: "language-current",
    };

    return Flag.continue(method);
  }
}
