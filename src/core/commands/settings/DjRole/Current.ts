import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class DjRoleCommand extends Command {
  public constructor() {
    super("djrole-current", {
      category: "flag",
    });
  }

  exec(message: Message) {
    const djRole = this.client.db.get(message.guild.id, "config.djRole");

    return message.util.send(
      new MessageEmbed().setColor("#7289DA").setDescription(
        message.translate("commands.settings.djrole.current", {
          role: djRole ? `<@&${djRole}>` : "Nothing",
        })
      )
    );
  }
}
