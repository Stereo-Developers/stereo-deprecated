import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class ShuffleCommand extends Command {
  public constructor() {
    super("shuffle", {
      aliases: ["shuffle", "mix"],
      description: (m: Message) =>
        m.translate("commands.music.shuffle.description"),
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

    if (!player.queue.next.length)
      return message.util.send(
        new MessageEmbed()
          .setColor("#7289DA")
          .setDescription(message.translate("commands.music.shuffle.error"))
      );

    player.queue.shuffle();

    return message.util.send(
      new MessageEmbed()
        .setColor("#7289DA")
        .setDescription(message.translate("commands.music.shuffle.success"))
    );
  }
}
