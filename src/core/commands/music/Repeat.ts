import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class RepeatCommand extends Command {
  public constructor() {
    super("repeat", {
      aliases: ["repeat", "loop"],
      args: [
        {
          id: "type",
          type: [["song", "track"], "queue"],
        },
      ],
      description: (m: Message) =>
        m.translate("commands.music.repeat.description"),
      channel: "guild",
      userPermissions: ["SEND_MESSAGES"],
    });
  }

  exec(message: Message, { type }: { type: "song" | "queue" }) {
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

    if (!type)
      return message.util.send(
        new MessageEmbed().setColor("#7289DA").setDescription(
          message.translate("commands.music.repeat.noargs", {
            the: player.repeating === "nothing" ? "" : "the",
            type: player.repeating,
          })
        )
      );

    if (!["queue", "song", "track"].includes(type.toLowerCase()))
      return message.util.send(
        new MessageEmbed().setColor("#f55e53").setDescription(
          message.translate("commands.music.repeat.error", {
            types: ["song", "track", "queue"]
              .map((type) => `\`${type}\``)
              .join(", "),
          })
        )
      );

    player.queue.loop(type.toLowerCase() as any);

    return message.util.send(
      new MessageEmbed().setColor("#7289DA").setDescription(
        message.translate("commands.music.repeat.success", {
          type: type.toLowerCase(),
          action: player.queue.repeat[type.toLowerCase()]
            ? "started"
            : "stopped",
        })
      )
    );
  }
}
