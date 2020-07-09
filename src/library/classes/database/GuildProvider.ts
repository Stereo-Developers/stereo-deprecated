import { Guild, Collection } from "discord.js";
import { settings } from "@prisma/client";
import { EventEmitter } from "events";
import dotprop from "dot-prop";

const defaultSettings = {
  config: {
    prefix: ["s!", "stereo "],
    language: "en-US",
    djRole: null,
  },
};

interface guildSettings {
  config: {
    prefix: string[];
    language: string;
    djRole: string | null;
  };
}

export class GuildProvider extends EventEmitter {
  public items = new Collection<string, any>();

  public async init(): Promise<void> {
    this.emit("initialized");

    for (const guild of await prisma.settings.findMany())
      this.items.set(guild.id, JSON.parse(guild.data));
  }

  public get<T>(guild: string | Guild, setting: string, defaultValue?: T): T {
    let entry =
      this.items.get(GuildProvider.getGuildID(guild)) ?? defaultSettings;
    return dotprop.get<T>(entry, setting) ?? defaultValue;
  }

  public getRaw(guild: string | Guild): guildSettings {
    return this.items.get(GuildProvider.getGuildID(guild));
  }

  public async set(
    guild: string | Guild,
    setting: string,
    value: any
  ): Promise<settings> {
    let item =
      this.items.get(GuildProvider.getGuildID(guild)) ??
      (await this.ensureTable(GuildProvider.getGuildID(guild)));
    dotprop.set(item, setting, value);
    this.items.set(GuildProvider.getGuildID(guild), item);

    this.emit("set", guild, setting, value);

    return await prisma.settings.update({
      where: {
        id: GuildProvider.getGuildID(guild),
      },
      data: {
        data: JSON.stringify(item),
      },
    });
  }

  public async delete(guild: string | Guild, setting: string) {
    const item =
      this.items.get(GuildProvider.getGuildID(guild)) ??
      (await this.ensureTable(GuildProvider.getGuildID(guild)));
    dotprop.delete(item, setting);
    this.items.set(GuildProvider.getGuildID(guild), item);

    this.emit("delete", guild, setting);

    return await prisma.settings.update({
      where: {
        id: GuildProvider.getGuildID(guild),
      },
      data: {
        data: JSON.stringify(item),
      },
    });
  }

  public async clear(guild: string | Guild): Promise<settings> {
    this.items.delete(GuildProvider.getGuildID(guild));

    this.emit("clear", guild);

    return await prisma.settings.delete({
      where: {
        id: GuildProvider.getGuildID(guild),
      },
    });
  }

  public async ensureTable(guild: string | Guild): Promise<guildSettings> {
    let item = this.items.get(GuildProvider.getGuildID(guild));

    if (!item) {
      await prisma.settings.create({
        data: {
          id: GuildProvider.getGuildID(guild),
          data: JSON.stringify(defaultSettings),
        },
      });
      item = defaultSettings;
    }

    return item;
  }

  public static getGuildID(guild: string | Guild): string {
    if (guild instanceof Guild) return guild.id;
    if (guild === "global" || guild === null) return "0";
    if (typeof guild === "string" && /^\d+$/.test(guild)) return guild;

    throw new TypeError(
      'Guild instance is undefined. Valid instances: guildID, "global" or null.'
    );
  }
}
