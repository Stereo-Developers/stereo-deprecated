import { Listener } from "discord-akairo";
import { Guild, MessageEmbed, TextChannel } from "discord.js";

export default class GuildRemoveeEvent extends Listener {
  public constructor() {
    super("guildRemove", {
      emitter: "client",
      event: "guildDelete",
    });
  }

  exec(guild: Guild) {
    const channel = this.client.channels.cache.get(
      config.get("bot.channels.guilds")
    ) as TextChannel;
    if (!channel) return;

    channel.send(
      new MessageEmbed()
        .setColor("#f55e53")
        .setDescription(
          `We have left **${guild.name}**.\n\n\nWe are now in **${this.client.guilds.cache.size}** guilds.`
        )
        .setThumbnail(guild.iconURL({ dynamic: true }))
    );
  }
}
