import { Command } from "discord-akairo";
import { Message, MessageEmbed, Util } from "discord.js";

import { decode } from "@lavalink/encoding";

export default class SkipCommand extends Command {
  public constructor() {
    super("skip", {
      aliases: ["skip", "next"],
      description: (m: Message) =>
        m.translate("commands.music.skip.description"),
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

    player.emit("end");

    return message.util.send(
      new MessageEmbed()
        .setColor("#7289DA")
        .setDescription(message.translate("commands.music.skip.success"))
    );
  }
}
