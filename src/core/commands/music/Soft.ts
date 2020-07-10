import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class SoftCommand extends Command {
  public constructor() {
    super("soft", {
      aliases: ["soft", "soften"],
      description: (m: Message) =>
        m.translate("commands.music.soft.description"),
      channel: "guild",
      userPermissions: ["SEND_MESSAGES"],
    });
  }

  async exec(message: Message) {
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

    if (player.filter === "soft") {
      await player.setEqualizer([]);

      player.filter = "default";

      return message.util.send(
        new MessageEmbed()
          .setColor("#7289DA")
          .setDescription(
            message.translate("commands.music.soft.responses.turnedoff")
          )
      );
    }

    await player.setEqualizer([
      { band: 0, gain: 0 },
      { band: 1, gain: 0 },
      { band: 2, gain: 0 },
      { band: 3, gain: 0 },
      { band: 4, gain: 0 },
      { band: 5, gain: 0 },
      { band: 6, gain: 0 },
      { band: 7, gain: 0 },
      { band: 8, gain: -0.25 },
      { band: 9, gain: -0.25 },
      { band: 10, gain: -0.25 },
      { band: 11, gain: -0.25 },
      { band: 12, gain: -0.25 },
      { band: 13, gain: -0.25 },
    ]);

    player.filter = "soft";

    return message.util.send(
      new MessageEmbed()
        .setColor("#7289DA")
        .setDescription(
          message.translate("commands.music.soft.responses.turnedon")
        )
    );
  }
}
