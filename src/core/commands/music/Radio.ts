import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import { Queue, Rest } from "../../../library";
import fetch from "node-fetch";

export default class RadioCommand extends Command {
  public constructor() {
    super("radio", {
      aliases: ["radio"],
      args: [
        {
          id: "station",
          match: "content",
          prompt: {
            start: (m: Message) =>
              m.translate("commands.music.radio.prompts.start"),
          },
        },
      ],
      description: (m: Message) =>
        m.translate("commands.music.radio.description"),
      channel: "guild",
      userPermissions: ["SEND_MESSAGES"],
    });
  }

  async exec(message: Message, { station }: { station: string }) {
    const { channel } = message.member.voice;
    if (!channel)
      return message.util.send(
        new MessageEmbed()
          .setColor("#f55e53")
          .setDescription(message.translate("commands.music.errors.novc"))
      );

    let player = this.client.music.players.get(message.guild.id);

    if (player && message.guild.me.voice.channelID !== channel.id)
      return message.util.send(
        new MessageEmbed()
          .setColor("#f55e53")
          .setDescription(message.translate("commands.music.errors.foreignvc"))
      );

    const permissions = channel
      .permissionsFor(message.guild.me)
      .missing(["CONNECT", "SPEAK"], true);
    if (permissions.length)
      return message.util.send(
        new MessageEmbed().setColor("#f55e53").setDescription(
          message.translate("commands.music.errors.missingperms", {
            permissions: this.formatPermissions(permissions),
          })
        )
      );

    if (!player)
      player = await this.client.music.create(
        {
          guild: message.guild.id,
        },
        { noConnect: true }
      );

    const data = await (
      await fetch(
        `https://de1.api.radio-browser.info/json/stations/byname/${encodeURIComponent(
          station
        )}`
      )
    ).json();

    if (!data.length)
      return message.util.send(
        new MessageEmbed().setColor("#f55e53").setDescription(
          message.translate("commands.music.errors.noresults", {
            query: station,
          })
        )
      );

    const { tracks } = await Rest.resolve(data[0].url);
    if (!tracks.length)
      return message.util.send(
        new MessageEmbed().setColor("#f55e53").setDescription(
          message.translate("commands.music.errors.noresults", {
            query: station,
          })
        )
      );

    player.queue.add(tracks[0].track, message.author.id);

    message.util.send(
      new MessageEmbed()
        .setColor("#7289DA")
        .setThumbnail(data[0].favicon || "")
        .setDescription(
          message.translate("commands.music.play.responses.song", {
            name: data[0].name,
            uri: data[0].url,
          })
        )
    );

    if (!player._connected)
      await player.connect(channel.id, { selfDeaf: true });

    if (!player.paused && !player.playing) await player.queue.start(message);
  }

  public formatPermissions(permissions: string[]) {
    const result = permissions.map(
      (str) =>
        `\`${str
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b(\w)/g, (char) => char.toUpperCase())}\``
    );

    return result.length > 1
      ? `${result.slice(0, -1).join(", ")} and ${result.slice(-1)[0]}`
      : result[0];
  }
}
