import { Listener } from "discord-akairo";
import { Guild, MessageEmbed, TextChannel } from "discord.js";

export default class GuildCreateEvent extends Listener {
  public constructor() {
    super("guildCreate", {
      emitter: "client",
      event: "guildCreate",
    });
  }

  exec(guild: Guild) {
    const channel = this.client.channels.cache.get(
      config.get("bot.channels.guilds")
    ) as TextChannel;
    if (!channel) return;

    channel.send(
      new MessageEmbed()
        .setColor("#34eb5e")
        .setDescription(
          `We have joined **${guild.name}**!\n\n\nWe are now in **${this.client.guilds.cache.size}** guilds.`
        )
        .setThumbnail(guild.iconURL({ dynamic: true }))
    );
  }
}
