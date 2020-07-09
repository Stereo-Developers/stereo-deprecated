import { Command } from "discord-akairo";
import { Message, MessageEmbed, Util } from "discord.js";

import { decode } from "@lavalink/encoding";

export default class NowplayingCommand extends Command {
  public constructor() {
    super("nowplaying", {
      aliases: ["nowplaying", "np", "current"],
      description: (m: Message) =>
        m.translate("commands.music.nowplaying.description"),
      channel: "guild",
      userPermissions: ["SEND_MESSAGES"],
    });
  }

  exec(message: Message) {
    const player = this.client.music.players.get(message.guild.id);
    if (!player || (player && !player.queue.current))
      return message.util.send(
        new MessageEmbed()
          .setColor("#f55e53")
          .setDescription(message.translate("commands.music.errors.noplayer"))
      );

    const { title, uri, length, identifier } = decode(
      player.queue.current.track
    );

    return message.util.send(
      new MessageEmbed()
        .setColor("#7289DA")
        .setThumbnail(`https://i.ytimg.com/vi/${identifier}/hqdefault.jpg`)
        .setDescription(
          message.translate("commands.music.nowplaying.embed", {
            progress: `\`${this.formatTime(player.position)} ${
              "▬".repeat(Math.floor((player.position / Number(length)) * 20)) +
              "■" +
              "-".repeat(
                20 - Math.floor((player.position / Number(length)) * 20)
              )
            } ${this.formatTime(Number(length))}\``,
            title: Util.escapeMarkdown(title),
            uri,
          })
        )
    );
  }

  public formatTime(duration: number) {
    const hours = Math.floor((duration / (1e3 * 60 * 60)) % 60),
      minutes = Math.floor(duration / 6e4),
      seconds = ((duration % 6e4) / 1e3).toFixed(0);

    //@ts-ignore
    return `${
      hours ? `${hours.toString().padStart(2, "0")}:` : ""
    }${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
}
