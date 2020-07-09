import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class ReseteCommand extends Command {
  public constructor() {
    super("reset", {
      aliases: ["reset"],
      description: (m: Message) =>
        m.translate("commands.music.reset.description"),
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

    player.send("filters", {});

    return message.util.send(
      new MessageEmbed()
        .setColor("#7289DA")
        .setDescription(message.translate("commands.music.reset.success"))
    );
  }
}
