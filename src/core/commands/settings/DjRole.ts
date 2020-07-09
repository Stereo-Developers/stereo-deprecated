import { Command, Flag } from "discord-akairo";
import { Message } from "discord.js";

export default class DjRoleCommand extends Command {
  public constructor() {
    super("djrole", {
      aliases: ["djrole", "dj"],
      description: (m: Message) =>
        m.translate("commands.settings.djrole.description"),
      channel: "guild",
      userPermissions: ["MANAGE_ROLES"],
    });
  }

  public *args() {
    const method = yield {
      type: [
        ["djrole-set", "set"],
        ["djrole-del", "del", "delete", "rm", "remove"],
        ["djrole-current", "current"],
      ],
      default: "djrole-current",
    };

    return Flag.continue(method);
  }
}
