import { Command } from "discord-akairo";
import { Message, MessageEmbed, Util } from "discord.js";

import { confirm } from "../../../library/functions";

export default class VolumeCommand extends Command {
  public constructor() {
    super("volume", {
      aliases: ["volume", "vol"],
      args: [
        {
          id: "amount",
          type: "number",
        },
      ],
      description: (m: Message) =>
        m.translate("commands.music.volume.description"),
      channel: "guild",
      userPermissions: ["SEND_MESSAGES"],
    });
  }

  async exec(message: Message, { amount }) {
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

    if (!amount)
      return message.util.send(
        new MessageEmbed().setColor("#7289DA").setDescription(
          message.translate("commands.music.volume.noargs", {
            volume: player.volume,
          })
        )
      );

    if (isNaN(amount) || amount > 200 || amount < 1)
      return message.util.send(
        new MessageEmbed().setColor("#f55e53").setDescription(
          message.translate("commands.music.volume.errors.wrongvol", {
            args: amount,
          })
        )
      );

    if (amount >= 115 && player.volume! <= 115) {
      const words = (message.translate("bot.prompts.confirmWords") ?? [
        "yes",
        "no",
      ]) as string[];

      const conf = await confirm(
        message,
        message.translate("commands.music.volume.errors.confirm", {
          amount,
          words: words.map((word) => `\`${word}\``).join(", "),
        })
      );

      if (!conf)
        return message.util.send(
          new MessageEmbed()
            .setColor("#f55e53")
            .setDescription(
              message.translate("commands.music.volume.errors.cancelled")
            )
        );
    }

    player.setVolume(Number(amount));

    return message.util.send(
      new MessageEmbed().setColor("#7289DA").setDescription(
        message.translate("commands.music.volume.success", {
          volume: amount,
        })
      )
    );
  }
}
