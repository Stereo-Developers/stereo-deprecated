import { Listener, Command } from "discord-akairo";
import { Message, MessageEmbed, GuildMember } from "discord.js";

export default class MissingPermissionsEvent extends Listener {
  public constructor() {
    super("missingPermissions", {
      emitter: "commandHandler",
      event: "missingPermissions",
    });
  }

  exec(message: Message, cmd: Command, type: "client" | "user", missing: any) {
    switch (type) {
      case "client":
        return message.util.send(
          new MessageEmbed().setColor("#f55e53").setDescription(
            message.translate("bot.events.permissions.bot", {
              s: missing.length > 1 ? "s" : "",
              permissions: this.formatPermissions(message.guild.me, missing),
            })
          )
        );
      case "user":
        return message.util.send(
          new MessageEmbed().setColor("#f55e53").setDescription(
            message.translate("bot.events.permissions.user", {
              s: missing.length > 1 ? "s" : "",
              permissions: this.formatPermissions(message.member, missing),
            })
          )
        );
    }
  }

  public formatPermissions(member: GuildMember, permissions: any[]) {
    const result = member.permissions.missing(permissions).map(
      (str) =>
        `**${str
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b(\w)/g, (char) => char.toUpperCase())}**`
    );

    return result.length > 1
      ? `${result.slice(0, -1).join(", ")} and ${result.slice(-1)[0]}`
      : result[0];
  }
}
