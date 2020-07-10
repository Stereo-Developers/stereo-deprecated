import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class NightcoreCommand extends Command {
  public constructor() {
    super("nightcore", {
      aliases: ["nightcore", "nc"],
      description: (m: Message) =>
        m.translate("commands.music.nightcore.description"),
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

    if (player.filter === "nightcore") {
      player.send("filters", {});

      player.filter = "default";

      return message.util.send(
        new MessageEmbed()
          .setColor("#7289DA")
          .setDescription(
            message.translate("commands.music.nightcore.responses.turnedoff")
          )
      );
    }

    player.send("filters", {
      equalizer: [
        { band: 1, gain: 0.3 },
        { band: 0, gain: 0.3 },
      ],
      timescale: { pitch: 1.2 },
      tremolo: { depth: 0.3, frequency: 14 },
    });

    player.filter = "nightcore";

    return message.util.send(
      new MessageEmbed()
        .setColor("#7289DA")
        .setDescription(
          message.translate("commands.music.nightcore.responses.turnedon")
        )
    );
  }
}
