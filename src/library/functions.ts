import { Message, MessageEmbed } from "discord.js";
import { AkairoClient } from "discord-akairo";
import { cpus, type } from "os";

export const confirm = async (message: Message, content: string) => {
  return new Promise(async (res, rej) => {
    try {
      const responses: string[] = message.translate(
        "bot.prompts.confirmWords"
      ) ?? ["yes", "no"];
      const msg = await message.util.send(
        new MessageEmbed().setColor("#f55e53").setDescription(content)
      );

      const filter = (m: Message) => m.author.id === message.author.id;

      msg.channel
        .awaitMessages(filter, { max: 1, errors: ["time"], time: 15e3 })
        .then((collected) => {
          const first = collected.first();

          if (!responses.includes(first.content.toLowerCase()))
            return rej(false);

          return res(first.content.toLowerCase() === responses[0]);
        })
        .catch(() => {
          return rej(false);
        });
    } catch (error) {
      (message.client as AkairoClient).logger.error(error);
      return rej(error);
    }
  });
};

export const average = () => {
  let totalIdle = 0;
  let totalTick = 0;

  for (let i = 0, len = cpus.length; i < len; i++) {
    let cpu = cpus[i];

    for (let type in cpu.times) totalTick += cpu.times[type];
    totalIdle += cpu.times.idle;
  }

  return {
    totalIdle,
    totalTick,
    avgIdle: totalIdle / cpus.length,
    avgTotal: totalTick / cpus.length,
  };
};

export const usage = (interval = 1000) => {
  return new Promise((res) => {
    if (typeof interval !== "number") throw new TypeError(`Invalid interval`);

    let startMeasure = average();

    setTimeout(() => {
      let endMeasure = average();
      let idleDifference = endMeasure.avgIdle - startMeasure.avgIdle;
      let totalDifference = endMeasure.avgTotal - startMeasure.avgTotal;

      return res(
        (10000 - Math.round((10000 * idleDifference) / totalDifference)) / 100
      );
    }, interval);
  });
};

export const operatingSystem = () => {
  return `${type()} ${
    /[a-z0-9\s.]+/gi.exec(
      `${require("fs").readFileSync("/etc/issue").toString()}`
    )[0]
  }`;
};
