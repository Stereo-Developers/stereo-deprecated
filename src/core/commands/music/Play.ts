import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import { Rest, Queue } from "../../../library";

export default class PlayCommand extends Command {
  public constructor() {
    super("play", {
      aliases: ["play", "p"],
      args: [
        {
          id: "song",
          match: "rest",
          prompt: {
            start: (m: Message) =>
              m.translate("commands.music.play.prompts.start"),
          },
        },

        {
          id: "type",
          match: "option",
          type: ["soundcloud", "youtube"],
          flag: ["--type=", "-type=", "--t=", "-t="],
          default: "youtube",
        },
      ],
      description: (m: Message) =>
        m.translate("commands.music.play.description"),
      channel: "guild",
      userPermissions: ["SEND_MESSAGES"],
    });
  }

  public async exec(
    message: Message,
    { song, type }: { song: string; type: string }
  ) {
    const { channel } = message.member.voice;
    if (!channel)
      return message.util.send(
        new MessageEmbed()
          .setColor("#f55e53")
          .setDescription(message.translate("commands.music.errors.novc"))
      );

    let player = this.client.music.players.get(message.guild.id);
    if (player && (!player.queue || !player.queue.current))
      await this.client.music.destroy(player.guild ?? message.guild.id);

    if (player && player.channel !== channel.id)
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

    const { loadType, tracks, playlistInfo, exception } = await Rest.resolve(
      song.includes("https://")
        ? encodeURI(song)
        : `${
            type === "youtube" ? "ytsearch:" : "scsearch:"
          }${encodeURIComponent(song)}`
    );

    if (exception) {
      await this.client.music.destroy(player.guild);

      return message.util.send(
        new MessageEmbed().setColor("#f55e53").setDescription(
          message.translate("commands.music.errors.exception", {
            message: exception.message,
          })
        )
      );
    }

    switch (loadType) {
      case "LOAD_FAILED":
      case "NO_MATCHES":
        return message.util.send(
          new MessageEmbed().setColor("#f55e53").setDescription(
            message.translate("commands.music.errors.noresults", {
              query: song.length > 60 ? `${song.substring(0, 60)}...` : song,
            })
          )
        );

      case "TRACK_LOADED":
        player.queue.add(tracks[0].track, message.author.id);

        message.util.send(
          new MessageEmbed()
            .setColor("#7289DA")
            .setThumbnail(
              `https://i.ytimg.com/vi/${tracks[0].info.identifier}/hqdefault.jpg`
            )
            .setDescription(
              message.translate("commands.music.play.responses.song", {
                name: tracks[0].info.title,
                uri: tracks[0].info.uri,
              })
            )
        );

        if (!player._connected)
          await player.connect(channel.id, { selfDeaf: true });

        if (!player.paused && !player.playing)
          await player.queue.start(message);
        break;

      case "PLAYLIST_LOADED":
        tracks.forEach((track) =>
          player.queue.add(track.track, message.author.id)
        );

        message.util.send(
          new MessageEmbed()
            .setColor("#7289DA")
            .setThumbnail(
              `https://i.ytimg.com/vi/${tracks[0].info.identifier}/hqdefault.jpg`
            )
            .setDescription(
              message.translate("commands.music.play.responses.playlist", {
                name: playlistInfo.name,
                amt: tracks.length,
              })
            )
        );

        if (!player._connected)
          await player.connect(channel.id, { selfDeaf: true });

        if (!player.paused && !player.playing)
          await player.queue.start(message);
        break;

      case "SEARCH_RESULT":
        const songs = tracks.slice(0, 5);

        const msg = await message.util.send(
          new MessageEmbed()
            .setColor("#7289DA")
            .setDescription(
              songs
                .map(
                  (track, index) =>
                    `**${index + 1}.** [${track.info.title}](${track.info.uri})`
                )
                .join("\n")
            )
        );

        const filter = (m: Message) => m.author.id === message.author.id;

        msg.channel
          .awaitMessages(filter, { time: 15e3, max: 1, errors: ["time"] })
          .then(async (collected) => {
            const first = collected.first();

            if (first.content.toLowerCase() === "cancel") {
              await this.client.music.destroy(player.guild);

              return message.util.send(
                new MessageEmbed()
                  .setColor("#7289DA")
                  .setDescription(
                    message.translate("commands.music.play.errors.cancelled")
                  )
              );
            }

            if (
              !this.handler.resolver.type("number")(message, first.content) ||
              Number(first.content) > 5 ||
              Number(first.content) < 1
            ) {
              await this.client.music.destroy(player.guild);

              return message.util.send(
                new MessageEmbed()
                  .setColor("#7289DA")
                  .setDescription(
                    message.translate("commands.music.play.errors.invalidtext")
                  )
              );
            }

            if (first.deletable) await first.delete();

            const track = tracks[Number(first.content) - 1];

            player.queue.add(track.track, message.author.id);

            message.util.send(
              new MessageEmbed()
                .setColor("#7289DA")
                .setThumbnail(
                  `https://i.ytimg.com/vi/${track.info.identifier}/hqdefault.jpg`
                )
                .setDescription(
                  message.translate("commands.music.play.responses.song", {
                    name: track.info.title,
                    uri: track.info.uri,
                  })
                )
            );

            if (!player._connected)
              await player.connect(channel.id, { selfDeaf: true });

            if (!player.paused && !player.playing)
              await player.queue.start(message);
          })
          .catch(() => {
            message.util.send(
              new MessageEmbed()
                .setColor("#7289DA")
                .setDescription(
                  message.translate("commands.music.play.errors.timeout")
                )
            );
          });
        break;
    }
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
