import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class SlowedCommand extends Command {
  public constructor() {
    super("slowed", {
      aliases: ["slowed"],
      description: (m: Message) =>
        m.translate("commands.music.slowed.description"),
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

    const { channel } = message.member.voice;
    if (!channel || player.channel !== message.member.voice.channel.id)
      return message.util.send(
        new MessageEmbed()
          .setColor("#f55e53")
          .setDescription(message.translate("commands.music.errors.foreignvc"))
      );

    if (player.filter === "slowed") {
      player.send("filters", {});

      player.filter = "default";

      return message.util.send(
        new MessageEmbed()
          .setColor("#7289DA")
          .setDescription(
            message.translate("commands.music.slowed.responses.turnedoff")
          )
      );
    }

    player.send("filters", {
      equalizer: [
        { band: 1, gain: 0.3 },
        { band: 0, gain: 0.3 },
      ],
      timescale: { pitch: 1.1, rate: 0.8 },
      tremolo: { depth: 0.3, frequency: 14 },
    });

    player.filter = "slowed";

    return message.util.send(
      new MessageEmbed()
        .setColor("#7289DA")
        .setDescription(
          message.translate("commands.music.slowed.responses.turnedon")
        )
    );
  }
}
