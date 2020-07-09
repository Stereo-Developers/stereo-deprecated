import { Command, Flag } from "discord-akairo";
import { Message } from "discord.js";

export default class PrefixCommand extends Command {
  public constructor() {
    super("prefix", {
      aliases: ["prefix", "prefixes"],
      description: (m: Message) =>
        m.translate("commands.settings.prefix.description"),
      channel: "guild",
      userPermissions: ["SEND_MESSAGES", "MANAGE_MESSAGES"],
    });
  }

  public *args() {
    const method = yield {
      type: [
        ["prefix-add", "add"],
        ["prefix-del", "del", "delete", "rm", "remove"],
        ["prefix-current", "current"],
      ],
      default: "prefix-current",
    };

    return Flag.continue(method);
  }
}
