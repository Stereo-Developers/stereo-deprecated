import { Command } from "discord-akairo";
import { Message, MessageEmbed, Role } from "discord.js";

export default class DjRoleCommand extends Command {
  public constructor() {
    super("djrole-set", {
      category: "flag",
      args: [
        {
          id: "role",
          type: "role",
          prompt: {
            start: (m: Message) =>
              m.translate("commands.settings.djrole.set.prompts.start"),
            retry: (m: Message) =>
              m.translate("commands.settings.djrole.set.prompts.retry"),
          },
        },
      ],
    });
  }

  exec(message: Message, { role }: { role: Role }) {
    const current = this.client.db.get(message.guild.id, "config.djRole");
    if (current === role.id)
      return message.util.send(
        new MessageEmbed()
          .setColor("#f55e53")
          .setDescription(
            message.translate("commands.settings.djrole.set.error", { role })
          )
      );

    this.client.db.set(message.guild.id, "config.djRole", role.id);

    return message.util.send(
      new MessageEmbed()
        .setColor("#7289DA")
        .setDescription(
          message.translate("commands.settings.djrole.set.success", { role })
        )
    );
  }
}
