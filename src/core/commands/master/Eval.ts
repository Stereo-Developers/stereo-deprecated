import { Command } from "discord-akairo";
import { Message, Util } from "discord.js";

import { inspect } from "util";

const lol: string = `I'm like 1, 2, 3, 4, 5! She never wanna pick up at my line`;

export default class EvalCommand extends Command {
  public hrStart: [number, number] | undefined;
  public lastResult: any = null;
  private readonly _sensitivePattern!: any;

  public constructor() {
    super("eval", {
      aliases: ["eval", "evaluate"],
      args: [
        {
          id: "code",
          type: "text",
          match: "rest",
          prompt: {
            start: "Please provide a phrase to evaluate",
          },
        },

        {
          id: "depth",
          type: "number",
          match: "option",
          flag: ["-d=", "-depth="],
          default: 0,
        },
      ],
      description: {
        content: "Evaluates JavaScript code",
        usage: "eval [phrase] <-d=> <-a>",
        examples: [
          "eval 2 + 2",
          "eval this.client.snipes -d=1",
          'eval this.client.users.fetch("535585397435006987").then(doReply)',
        ],
      },
      ownerOnly: true,
    });

    Object.defineProperty(this, "_sensitivePattern", {
      value: null,
      configurable: true,
    });
  }

  public async exec(
    message: Message,
    { code, depth }: { code: string; depth: number }
  ) {
    const doReply = (val: string | Error) => {
      if (val instanceof Error) {
        message.util!.send(`Error (Callback): \`${val}\``);
      } else {
        const result = this.result(val, process.hrtime(this.hrStart));
        for (const res of result) message.channel!.send(res);
      }
    };

    let hrDiff: [number, number];
    try {
      const hrStart = process.hrtime();
      this.lastResult = eval(code);
      hrDiff = process.hrtime(hrStart);
    } catch (error) {
      return message.util.send(`Error:\`\`\`js\n${error}\`\`\``);
    }

    this.hrStart = process.hrtime();
    const result = this.result(this.lastResult, hrDiff, code, depth);
    if (Array.isArray(result))
      // @ts-ignore
      return result.map(
        async (res): Promise<Message | Message[]> => message.util.send(res)
      );
    return message.util!.send(result);
  }

  private result(
    result: any,
    hrDiff: [number, number],
    input: string | null = null,
    depth?: number
  ): string | string[] {
    const inspected = inspect(result, { depth: depth })
      .replace(new RegExp("!!NL!!"), "\n")
      .replace(this.sensitivePattern, lol);

    const split = inspected.split("\n");
    const last = inspected.length - 1;

    const prependPart =
      inspected[0] !== "{" && inspected[0] !== "[" && inspected[0] !== '"'
        ? split[0]
        : inspected[0];
    const appendPart =
      inspected[last] !== "}" &&
      inspected[last] !== "]" &&
      inspected[last] !== '"'
        ? split[split.length - 1]
        : inspected[last];
    const prepend = `\`\`\`js\n${prependPart}\n`;
    const append = `\n${appendPart}\n\`\`\``;

    if (input) {
      return Util.splitMessage(
        `*Ran after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ""}${
          hrDiff[1] / 1000000
        }ms.*\`\`\`js\n${inspected}\`\`\``,
        { maxLength: 1900, prepend, append }
      );
    }

    return Util.splitMessage(
      `*Callback ran after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ""}${
        hrDiff[1] / 1000000
      }ms.*\`\`\`js\n${inspected}\`\`\``,
      { maxLength: 1900, prepend, append }
    );
  }

  private get sensitivePattern(): any {
    if (!this._sensitivePattern) {
      const token = this.client.token!.split("").join("[^]{0,2}");
      const revToken = this.client.token!.split("").reverse().join("[^]{0,2}");
      Object.defineProperty(this, "_sensitivePattern", {
        value: new RegExp(`${token}|${revToken}`, "g"),
      });
    }
    return this._sensitivePattern;
  }
}
