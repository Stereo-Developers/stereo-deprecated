import { Inhibitor, Command } from "discord-akairo";
import { Message } from "discord.js";

export default class DjRoleInhibitor extends Inhibitor {
  public constructor() {
    super("djrole", {
      reason: "djrole",
    });
  }

  exec(message: Message, cmd: Command): boolean {
    return (
      (this.client.db.get(message.guild.id, "config.djRole") &&
        !message.member.roles.cache.has(
          this.client.db.get(message.guild.id, "config.djRole")
        ) &&
        cmd.categoryID === "music" &&
        !["play", "nowplaying", "radio", "queue"].includes(cmd.id) &&
        !message.member.permissions.has("ADMINISTRATOR", true)) ||
      (message.member.voice.connection &&
        message.member.voice.channel.members.size !== 2)
    );
  }
}
