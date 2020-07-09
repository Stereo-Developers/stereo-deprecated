import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class PingCommand extends Command {
  public constructor() {
    super("ping", {
      aliases: ["ping", "latency"],
      description: (m: Message) =>
        m.translate("commands.info.ping.description"),
      userPermissions: ["SEND_MESSAGES"],
    });
  }

  async exec(message: Message) {
    let date = Date.now();

    return new Promise((res) => {
      (this.client["api"] as any).channels[message.channel.id].typing
        .post()
        .then(() => {
          res(
            message.util.send(
              new MessageEmbed().setColor("#7289DA").setDescription(
                message.translate("commands.info.ping.response", {
                  heartbeat: this.client.ws.ping,
                  roundtrip: Date.now() - date,
                })
              )
            )
          );
        });
    });
  }
}
