import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

const gains = {
  hard: 0.12,
  medium: 0.07,
  low: 0.04,
  none: 0,
};
const levels = ["hard", "medium", "low", "none"];

export default class BassboostCommand extends Command {
  public constructor() {
    super("bassboost", {
      aliases: ["bassboost", "bb"],
      args: [
        {
          id: "level",
          type: levels,
        },
      ],
      description: (m: Message) =>
        m.translate("commands.music.bassboost.description"),
      channel: "guild",
      userPermissions: ["SEND_MESSAGES"],
    });
  }

  async exec(message: Message, { level }) {
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

    if (!level)
      return message.util.send(
        new MessageEmbed().setColor("#7289DA").setDescription(
          message.translate("commands.music.bassboost.noargs", {
            level: player.bass,
          })
        )
      );

    if (!levels.includes(level.toLowerCase()))
      return message.util.send(
        new MessageEmbed().setColor("#f55e53").setDescription(
          message.translate("commands.music.bassboost.error", {
            levels: levels.map((lvl) => `\`${lvl}\``).join(", "),
            level: level.length > 20 ? level.substring(0, 20) : level,
          })
        )
      );

    await player.setEqualizer(
      Array(6)
        .fill(null)
        .map((_, i) => ({ band: i++, gain: gains[level.toLowerCase()] }))
    );

    player.bass = level.toLowerCase();

    return message.util.send(
      new MessageEmbed().setColor("#7289DA").setDescription(
        message.translate("commands.music.bassboost.success", {
          level: level.toLowerCase(),
        })
      )
    );
  }
}
