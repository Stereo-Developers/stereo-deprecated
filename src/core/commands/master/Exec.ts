import { Command } from "discord-akairo";
import { Message, Util } from "discord.js";

import { execSync } from "child_process";

export default class ExecCommand extends Command {
  public constructor() {
    super("exec", {
      aliases: ["exec", "execute"],
      args: [
        {
          id: "command",
          match: "content",
          prompt: {
            start: "What would you like to execute?",
          },
        },
      ],
      description: {
        content: "Executes a command in a bash terminal, but on the bot!",
        usage: "exec (command)",
        examples: ["exec pm2 ls", "exec screen -ls"],
      },
      ownerOnly: true,
    });
  }

  exec(message: Message, { command }: { command: string }) {
    try {
      return message.util.send(
        Util.splitMessage(execSync(command).toString(), { maxLength: 1900 }),
        { code: "bash" }
      );
    } catch (error) {
      return message.util.send(Util.splitMessage(error, { maxLength: 1950 }));
    }
  }
}
