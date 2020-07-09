import {
  AkairoClient,
  CommandHandler,
  ListenerHandler,
  InhibitorHandler,
} from "discord-akairo";
import { MessageEmbed, Message } from "discord.js";
import { GuildProvider, StereoClientOptions, LanguageProvider } from ".";
import { Manager } from "lavaclient";
import Logger from "@ayanaware/logger";
import { join } from "path";

export class StereoClient extends AkairoClient {
  public db: GuildProvider = new GuildProvider();
  public logger: Logger = Logger.get(StereoClient);
  public languages = new LanguageProvider(this, join("languages"));

  public music: Manager = new Manager(config.get("nodes"), {
    shards: this.shard ? this.shard.count : 1,
    send: (id, payload) => {
      const guild = this.guilds.cache.get(id);
      if (guild) return guild.shard.send(payload);
      return;
    },
  });

  public constructor(public configuration: StereoClientOptions) {
    super({
      ownerID: configuration.owners,
      disableMentions: "everyone",
      messageCacheMaxSize: 50,
      messageCacheLifetime: 60,
      messageSweepInterval: 100,
      ws: {
        intents: [
          "GUILDS",
          "GUILD_MESSAGES",
          "GUILD_VOICE_STATES",
          "GUILD_MESSAGE_REACTIONS",
        ],
      },
    });
  }

  public commandHandler: CommandHandler = new CommandHandler(this, {
    directory: join(this.configuration.builtDirectory, "core", "commands"),
    allowMention: true,
    prefix: (msg) =>
      msg.guild
        ? this.db.get(msg.guild, "config.prefix", config.get("bot.prefix"))
        : config.get("bot.prefix"),
    blockBots: true,
    blockClient: true,
    commandUtil: true,
    handleEdits: true,
    argumentDefaults: {
      prompt: {
        modifyStart: (msg, text) =>
          new MessageEmbed()
            .setColor("#f55e53")
            .setDescription(
              msg.translate("bot.prompts.start", { prompt: text })
            ),
        modifyRetry: (msg, text) =>
          new MessageEmbed()
            .setColor("#f55e53")
            .setDescription(
              msg.translate("bot.prompts.start", { prompt: text })
            ),
        cancel: (msg: Message) =>
          new MessageEmbed()
            .setColor("#f55e53")
            .setDescription(msg.translate("bot.prompts.cancel")),
        timeout: (msg: Message) =>
          new MessageEmbed()
            .setColor("#f55e53")
            .setDescription(msg.translate("bot.prompts.timeout")),
        ended: (msg: Message) =>
          new MessageEmbed()
            .setColor("#f55e53")
            .setDescription(msg.translate("bot.prompts.ended")),
        time: 3e4,
        retries: 2,
      },
      otherwise: "",
    },
    aliasReplacement: /-/g,
    automateCategories: true,
    ignoreCooldown: this.ownerID,
    ignorePermissions: this.ownerID,
    defaultCooldown: 15e3
  });

  public eventHandler: ListenerHandler = new ListenerHandler(this, {
    directory: join(this.configuration.builtDirectory, "core", "events"),
  });

  public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {
    directory: join(this.configuration.builtDirectory, "core", "inhibitors"),
  });

  public async start(): Promise<string> {
    this.commandHandler.useListenerHandler(this.eventHandler);
    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);

    this.eventHandler.setEmitters({
      commandHandler: this.commandHandler,
      websocket: this.ws,
      music: this.music,
      process,
    });

    await this.db.init();
    await this.music.init(config.get("bot.id"));

    [
      this.commandHandler,
      this.eventHandler,
      this.inhibitorHandler,
      this.languages,
    ].forEach((x) => x.loadAll());

    return super.login(this.configuration.token);
  }
}
