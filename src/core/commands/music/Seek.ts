import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import { decode } from "@lavalink/encoding";
import ms from "ms";

export default class SeekCommand extends Command {
  public constructor() {
    super("seek", {
      aliases: ["seek", "goto"],
      args: [
        {
          id: "timestamp",
          type: (_, str) => {
            if (!str || typeof str !== "string") return null;

            return ms(str) || this.parseTimeString(str);
          },
          prompt: {
            start: (m: Message) =>
              m.translate("commands.music.seek.prompts.start"),
            retry: (m: Message) =>
              m.translate("commands.music.seek.prompts.retry"),
          },
        },
      ],
      description: (m: Message) =>
        m.translate("commands.music.seek.description"),
      channel: "guild",
    });
  }

  public async exec(message: Message, { timestamp }: { timestamp: number }) {
    const player = this.client.music.players.get(message.guild.id);
    if (!player || (player && !player.queue.current))
      return message.util.send(
        new MessageEmbed()
          .setColor("#f55e53")
          .setDescription(message.translate("commands.music.errors.noplayer"))
      );

    const { channel } = message.member.voice;
    if (!channel || player.channel !== message.member.voice.channel.id)
      return message.util.send(
        new MessageEmbed()
          .setColor("#f55e53")
          .setDescription(message.translate("commands.music.errors.foreignvc"))
      );

    if (Number(decode(player.track).length) < timestamp)
      return message.util.send(
        new MessageEmbed().setColor("#f55e53").setDescription(
          message.translate("commands.music.seek.error", {
            time: ms(timestamp, { long: true }),
          })
        )
      );

    await player.seek(timestamp);

    return message.util.send(
      new MessageEmbed().setColor("#7289DA").setDescription(
        message.translate("commands.music.seek.success", {
          time: ms(timestamp, { long: true }),
        })
      )
    );
  }

  public parseTimeString(time: string) {
    let newNumber = 0,
      toMultiply = 60000;

    if (!/\d{1,2}:\d{2}/g.exec(time)) return null;

    for (const num of time.split(":")) {
      newNumber = Math.floor(Number(num) * toMultiply) + newNumber;
      toMultiply = 1000;
    }

    return newNumber;
  }
}
