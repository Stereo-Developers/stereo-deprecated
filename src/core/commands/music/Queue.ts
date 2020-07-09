import { Command } from "discord-akairo";
import { Message, MessageEmbed, Util } from "discord.js";

import { decode } from "@lavalink/encoding";

export default class QueueCommand extends Command {
  public constructor() {
    super("queue", {
      aliases: ["queue", "q"],
      args: [
        {
          id: "page",
          type: "number",
          default: 1,
        },
      ],
      description: (m: Message) =>
        m.translate("commands.music.queue.description"),
      channel: "guild",
      userPermissions: ["SEND_MESSAGES"],
    });
  }

  exec(message: Message, { page }: { page: number }) {
    const player = this.client.music.players.get(message.guild.id);
    if (!player || (player && !player.queue.current))
      return message.util.send(
        new MessageEmbed()
          .setColor("#f55e53")
          .setDescription(message.translate("commands.music.errors.noplayer"))
      );

    const { title, uri } = decode(player.queue.current.track);

    const embed = new MessageEmbed()
      .setColor("#7289DA")
      .setAuthor(
        message.translate("commands.music.queue.embeds.author", {
          guild: message.guild.name,
        }),
        message.guild.iconURL({ dynamic: true })
      )
      .addField(
        message.translate("commands.music.queue.embeds.field"),
        `[${title}](${uri})`
      );

    if (!player.queue.next.length) return message.util.send(embed);

    const maxPages = Math.ceil(player.queue.next.length / 10);
    if (page > maxPages || page < 1) page = 1;

    const items = player.queue.next.map((data, index) => {
      const { title, uri } = decode(data.track);
      return {
        title:
          title.length > 20
            ? Util.escapeMarkdown(title.substring(0, 40))
            : Util.escapeMarkdown(title),
        uri,
        index,
      };
    });

    const display = items.slice((page - 1) * 10, page * 10);

    return message.util.send(
      embed
        .setDescription(
          display
            .map(
              (data) => `**${data.index + 1}.** [${data.title}](${data.uri})`
            )
            .join("\n")
        )
        .setFooter(`Page: ${page} / ${maxPages}`)
    );
  }
}
