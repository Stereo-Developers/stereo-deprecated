import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class HelpCommand extends Command {
  public constructor() {
    super("help", {
      aliases: ["help", "commands", "cmds"],
      args: [
        {
          id: "command",
          type: "commandAlias",
        },
      ],
      description: (m: Message) =>
        m.translate("commands.info.help.description"),
      userPermissions: ["SEND_MESSAGES"],
    });
  }

  exec(message: Message, { command }: { command: Command }) {
    const embed = new MessageEmbed().setColor("#7289DA");

    if (!command) {
      for (const [name, category] of this.handler.categories.filter(
        this.categoryFilter(message)
      )) {
        embed.addField(
          `• ${name.replace(/(\b\w)/gi, (str) => str.toUpperCase())} (${
            category.size
          })`,
          category
            .filter((cmd) => (cmd.aliases ? cmd.aliases.length > 0 : false))
            .map((cmd) => `\`${cmd.aliases[0]}\``)
            .join(", ") || "oof"
        );
      }

      return message.util.send(
        embed
          .setAuthor(
            message.translate("commands.info.help.embeds.main.author", {
              member: message.author.username,
            }),
            message.author.displayAvatarURL({ dynamic: true })
          )
          .setFooter(
            message.translate("commands.info.help.embeds.main.footer", {
              botname: this.client.user.username,
            })
          )
      );
    }

    const description =
      typeof command.description === "function"
        ? command.description(message)
        : command.description;

    return message.util.send(
      embed
        .setAuthor(
          message.translate("commands.info.help.embeds.main.author", {
            member: message.author.username,
          }),
          message.author.displayAvatarURL({ dynamic: true })
        )
        .setFooter(
          message.translate("commands.info.help.embeds.main.footer", {
            botname: this.client.user.username,
          })
        )
        .addField(
          message.translate("commands.info.help.embeds.info.fields.main"),
          `**Aliases**: ${command.aliases
            .map((alias) => `\`${alias}\``)
            .join(", ")}`
        )
        .addField(
          message.translate("commands.info.help.embeds.info.fields.other"),
          `${Object.keys(description)
            .map(
              (key) =>
                `**${key.replace(/(\b\w)/gi, (str) => str.toUpperCase())}**: ${
                  Array.isArray(description[key])
                    ? `\n${description[key]
                        .map((value: string) => `\`${value}\``)
                        .join("\n")}`
                    : description[key]
                }`
            )
            .join("\n")}`,
          true
        )
    );
  }

  private categoryFilter(message: Message) {
    return (c) =>
      ![
        "flag",
        ...(this.client.ownerID.includes(message.author.id) || !message.guild
          ? []
          : message.member.hasPermission("MANAGE_GUILD", {
              checkAdmin: true,
              checkOwner: true,
            })
          ? ["master", "flag"]
          : ["flag", "master", "settings"]),
      ].includes(c.id);
  }
}
