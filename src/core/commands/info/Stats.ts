import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import { operatingSystem } from "../../../library/functions";
import fetch from "node-fetch";

export default class StatsCommand extends Command {
  public constructor() {
    super("stats", {
      aliases: ["stats", "botinfo"],
      description: (m: Message) =>
        m.translate("commands.info.stats.description"),
      userPermissions: ["SEND_MESSAGES"],
    });
  }

  async exec(message: Message) {
    const stats: any = message.translate("commands.info.stats.embed");

    return message.util.send(
      new MessageEmbed()
        .setColor("#7289DA")
        .setAuthor(
          message.translate("commands.info.stats.embed.author", {
            bot: this.client.user.username,
          }),
          this.client.user.displayAvatarURL()
        )
        .addField(
          stats.fields.basic.name,
          message.translate("commands.info.stats.embed.fields.basic.text", {
            guilds: this.client.guilds.cache.size,
            users: Intl.NumberFormat().format(this.client.users.cache.size),
            emojis: this.client.emojis.cache.size,
            shards: this.client.shard ? this.client.shard.count : 1,
          }),
          true
        )
        .addField(
          stats.fields.versions.name,
          message.translate("commands.info.stats.embed.fields.versions.text", {
            nodejs: process.version,
            npm: require("child_process")
              .execSync("npm -v")
              .toString()
              .replace("\n", ""),
            discordjs: require("discord.js").version,
            akairo: require("discord-akairo").version,
          }),
          true
        )
        .addField(
          stats.fields.advanced.name,
          message.translate("commands.info.stats.embed.fields.advanced.text", {
            os: operatingSystem(),
            cpuusage: (process.cpuUsage().user / 1024 / 1024).toFixed(2),
            memusage: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
            players: this.client.music.players.size,
          }),
          true
        )
        .addField(stats.fields.github.name, await this.commits())
    );
  }

  public async commits() {
    const json = await (
      await fetch(`https://api.github.com/repos/StereoDevelopments/stereo/commits`)
    ).json();

    let str = "";

    for (const { sha, html_url, commit, author } of json.slice(0, 5)) {
      str += `[\`${sha.slice(0, 7)}\`](${html_url}) ${commit.message.substring(
        0,
        80
      )} - **[@${author.login.toLowerCase()}](${author.html_url})**\n`;
    }

    return str || "No commits right now....";
  }
}
