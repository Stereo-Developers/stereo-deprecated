import { Command } from "discord-akairo";
import { Message } from "discord.js";

import { execSync } from "child_process";

export default class SpeedtestCommand extends Command {
  public constructor() {
    super("speedtest", {
      aliases: ["speedtest", "test"],
      description: (m: Message) =>
        m.translate("commands.info.speedtest.description"),
    });
  }

  exec(message: Message) {
    try {
      const data = execSync(
        `curl -s https://raw.githubusercontent.com/sivel/speedtest-cli/master/speedtest.py | python -`
      )
        .toString()
        .split("\n")
        .filter(
          (str) => str.startsWith("Download:") || str.startsWith("Upload:")
        );

      message.util.send(
        message.translate("commands.info.speedtest.response", {
          download: data[0].split("Download: ").join(""),
          upload: data[1].split("Upload: ").join(""),
        })
      );
    } catch (error) {
      return message.channel.send(`Couldn't retrive information`);
    }
  }
}
